import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateRecommendations } from '@/lib/groq-client'
import { requireSessionWithOrg, requireTier } from '@/lib/api-auth'
import { Tier } from '@prisma/client'

// POST /api/v1/recommendations — Generate AI recommendations (project-scoped)
export async function POST(request: Request) {
  const { organizationId, tier, response } = await requireSessionWithOrg(request)
  if (response) return response

  const tierResponse = requireTier(tier!, Tier.PRO)
  if (tierResponse) return tierResponse

  const body = await request.json()
  const { projectId } = body

  // Get project IDs to analyze
  const projectIds = projectId
    ? [projectId]
    : (
        await prisma.project.findMany({
          where: { organizationId: organizationId! },
          select: { id: true },
        })
      ).map((p) => p.id)

  if (projectIds.length === 0) {
    return NextResponse.json({
      recommendations: [],
      message: 'No projects found. Create a project first!',
    })
  }

  // Get usage data for the past 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [requests, totalSpend] = await Promise.all([
    prisma.request.findMany({
      where: {
        projectId: { in: projectIds },
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
        projectId: { in: projectIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { cost: true },
    }),
  ])

  if (requests.length === 0) {
    return NextResponse.json({
      recommendations: [],
      message: 'Not enough data to generate recommendations. Install the SDK and make some API calls first!',
    })
  }

  // Aggregate by endpoint
  const endpointMap = new Map<
    string,
    {
      endpoint: string
      models: Set<string>
      totalTokens: number
      totalCost: number
      requestCount: number
    }
  >()

  requests.forEach((r) => {
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

  const usagePatterns = Array.from(endpointMap.values()).map((e) => ({
    endpoint: e.endpoint,
    avgTokens: e.totalTokens / e.requestCount,
    requestCount: e.requestCount,
    totalCost: e.totalCost,
    model: Array.from(e.models).join(', '),
  }))

  // Get top models
  const modelMap = new Map<string, { cost: number; requests: number }>()
  requests.forEach((r) => {
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
  requests.forEach((r) => {
    const existing = providerMap.get(r.provider) || 0
    providerMap.set(r.provider, existing + r.cost)
  })

  const topProviders = Array.from(providerMap.entries())
    .map(([provider, cost]) => ({ provider, cost }))
    .sort((a, b) => b.cost - a.cost)

  // Generate recommendations using Groq
  const recommendations = await generateRecommendations({
    organizationId: organizationId!,
    usagePatterns,
    totalSpend: totalSpend._sum.cost || 0,
    topModels,
    topProviders,
  })

  // Persist recommendations
  if (recommendations.length > 0 && projectId) {
    // Clear old non-dismissed recommendations for this project
    await prisma.recommendation.deleteMany({
      where: { projectId, isDismissed: false, isImplemented: false },
    })

    await prisma.recommendation.createMany({
      data: recommendations.map((r: { type: string; priority: string; title: string; description: string; estimatedSavings?: number; implementationEffort?: string }) => ({
        projectId,
        type: r.type,
        priority: r.priority,
        title: r.title,
        description: r.description,
        estimatedSavings: r.estimatedSavings ?? null,
        implementationEffort: r.implementationEffort ?? null,
      })),
    })
  }

  return NextResponse.json({ recommendations })
}

// GET /api/v1/recommendations — Get stored recommendations (project-scoped)
export async function GET(request: Request) {
  const { organizationId, tier, response } = await requireSessionWithOrg(request)
  if (response) return response

  const tierResponse = requireTier(tier!, Tier.PRO)
  if (tierResponse) return tierResponse

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  const projectIds = projectId
    ? [projectId]
    : (
        await prisma.project.findMany({
          where: { organizationId: organizationId! },
          select: { id: true },
        })
      ).map((p) => p.id)

  const recommendations = await prisma.recommendation.findMany({
    where: {
      projectId: { in: projectIds },
      isDismissed: false,
    },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    include: {
      project: { select: { name: true } },
    },
  })

  return NextResponse.json({ recommendations })
}
