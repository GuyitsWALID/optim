import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCost, getModelPricing } from '@/lib/model-pricing'
import { analyzeRequestComplexity } from '@/lib/groq-client'

// POST /api/v1/requests - Track an LLM request
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      organizationId,
      apiKey,
      model,
      provider,
      promptTokens,
      completionTokens,
      latency,
      endpoint,
      userId,
      teamId,
      feature,
      tags,
      messages,
      status = 'success',
      errorMessage,
    } = body

    // Validate required fields
    if (!organizationId || !apiKey || !model) {
      return NextResponse.json(
        { error: 'organizationId, apiKey, and model are required' },
        { status: 400 }
      )
    }

    // Find the API key
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { organization: true },
    })

    if (!apiKeyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Verify organization matches
    if (apiKeyRecord.organizationId !== organizationId) {
      return NextResponse.json({ error: 'API key does not belong to organization' }, { status: 403 })
    }

    // Calculate cost
    const cost = calculateCost(model, promptTokens, completionTokens)

    // Analyze complexity for potential routing
    const complexity = await analyzeRequestComplexity('', messages)

    // Check if auto-optimize is enabled
    const autoOptimizeConfig = await prisma.autoOptimizeConfig.findUnique({
      where: { organizationId },
    })

    let recommendedModel = null
    let autoRouted = false

    if (autoOptimizeConfig?.isEnabled) {
      // Simple routing logic based on complexity
      const currentModelPricing = getModelPricing(model)

      if (currentModelPricing && complexity === 'simple' && currentModelPricing.capabilityTier === 'high') {
        // Find a cheaper alternative for simple requests
        const pricing = getModelPricing(model)
        if (pricing) {
          // Get cheaper alternatives - for now just flag it
          // In production, this would actually route to the cheaper model
          recommendedModel = model.replace('gpt-4', 'gpt-4o-mini')
            .replace('claude-3-opus', 'claude-3-5-haiku')
            .replace('gemini-1.5-pro', 'gemini-1.5-flash')
        }
        autoRouted = true
      }
    }

    // Create request record
    const requestRecord = await prisma.request.create({
      data: {
        organizationId,
        apiKeyId: apiKeyRecord.id,
        model,
        provider: provider || apiKeyRecord.provider,
        endpoint: endpoint || '/chat/completions',
        promptTokens: promptTokens || 0,
        completionTokens: completionTokens || 0,
        totalTokens: (promptTokens || 0) + (completionTokens || 0),
        cost,
        latency,
        userId,
        teamId,
        feature,
        tags: tags ? JSON.stringify(tags) : null,
        status,
        errorMessage,
      },
    })

    // Update API key last used
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    })

    // Update daily summary
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailySummary.upsert({
      where: {
        organizationId_date: {
          organizationId,
          date: today,
        },
      },
      update: {
        totalRequests: { increment: 1 },
        totalCost: { increment: cost },
        totalTokens: { increment: (promptTokens || 0) + (completionTokens || 0) },
        promptTokens: { increment: promptTokens || 0 },
        completionTokens: { increment: completionTokens || 0 },
      },
      create: {
        organizationId,
        date: today,
        totalRequests: 1,
        totalCost: cost,
        totalTokens: (promptTokens || 0) + (completionTokens || 0),
        promptTokens: promptTokens || 0,
        completionTokens: completionTokens || 0,
      },
    })

    return NextResponse.json({
      success: true,
      requestId: requestRecord.id,
      cost,
      recommendedModel,
      autoRouted,
      complexity,
    })
  } catch (error) {
    console.error('Error tracking request:', error)
    return NextResponse.json({ error: 'Failed to track request' }, { status: 500 })
  }
}

// GET /api/v1/requests - Get recent requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const requests = await prisma.request.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        apiKey: {
          select: { id: true, name: true, provider: true },
        },
      },
    })

    const total = await prisma.request.count({ where: { organizationId } })

    return NextResponse.json({ requests, total, limit, offset })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}
