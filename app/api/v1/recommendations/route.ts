import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateRecommendations } from '@/lib/groq-client'

// POST /api/v1/recommendations - Generate AI recommendations
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organizationId } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    // Get usage data for the past 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [requests, totalSpend] = await Promise.all([
      prisma.request.findMany({
        where: {
          organizationId,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          endpoint: true,
          model: true,
          provider: true,
          totalTokens: true,
          cost: true,
        },
      }),
      prisma.request.aggregate({
        where: {
          organizationId,
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { cost: true },
      }),
    ])

    if (requests.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: 'Not enough data to generate recommendations. Make some API calls first!',
      })
    }

    // Aggregate by endpoint
    const endpointMap = new Map<string, {
      endpoint: string
      models: Set<string>
      totalTokens: number
      totalCost: number
      requestCount: number
    }>()

    requests.forEach(r => {
      const endpoint = r.endpoint || 'default'
      const existing = endpointMap.get(endpoint) || {
        endpoint,
        models: new Set<string>(),
        totalTokens: 0,
        totalCost: 0,
        requestCount: 0,
      }
      existing.models.add(r.model)
      existing.totalTokens += r.totalTokens
      existing.totalCost += r.cost
      existing.requestCount += 1
      endpointMap.set(endpoint, existing)
    })

    const usagePatterns = Array.from(endpointMap.values()).map(e => ({
      endpoint: e.endpoint,
      avgTokens: e.totalTokens / e.requestCount,
      requestCount: e.requestCount,
      totalCost: e.totalCost,
      model: Array.from(e.models).join(', '),
    }))

    // Get top models
    const modelMap = new Map<string, { cost: number; requests: number }>()
    requests.forEach(r => {
      const existing = modelMap.get(r.model) || { cost: 0, requests: 0 }
      existing.cost += r.cost
      existing.requests += 1
      modelMap.set(r.model, existing)
    })

    const topModels = Array.from(modelMap.entries())
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)

    // Get top providers
    const providerMap = new Map<string, number>()
    requests.forEach(r => {
      const existing = providerMap.get(r.provider) || 0
      providerMap.set(r.provider, existing + r.cost)
    })

    const topProviders = Array.from(providerMap.entries())
      .map(([provider, cost]) => ({ provider, cost }))
      .sort((a, b) => b.cost - a.cost)

    // Generate recommendations using Groq
    const recommendations = await generateRecommendations({
      organizationId,
      usagePatterns,
      totalSpend: totalSpend._sum.cost || 0,
      topModels,
      topProviders,
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

// GET /api/v1/recommendations - Get stored recommendations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const recommendations = await prisma.recommendation.findMany({
      where: {
        organizationId,
        isDismissed: false,
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
