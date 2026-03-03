import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCost } from '@/lib/model-pricing'

interface IngestEvent {
  provider: string
  model: string
  originalModel?: string
  promptTokens: number
  completionTokens: number
  totalTokens?: number
  estimatedCost?: number
  latencyMs?: number
  isStreaming?: boolean
  status?: 'success' | 'error'
  errorType?: string
  statusCode?: number
  tags?: Record<string, string>
  userId?: string
  feature?: string
  sdkVersion?: string
  runtime?: string
  timestamp?: string
  requestId?: string
}

// POST /api/v1/ingest — SDK sends telemetry here
// Authenticated by project key (Bearer token)
export async function POST(request: Request) {
  try {
    // Extract project key from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing Authorization header. Use: Bearer opt_proj_...' },
        { status: 401 }
      )
    }

    const projectKey = authHeader.substring(7).trim()
    if (!projectKey.startsWith('opt_proj_')) {
      return NextResponse.json(
        { error: 'Invalid project key format' },
        { status: 401 }
      )
    }

    // Look up the project
    const project = await prisma.project.findUnique({
      where: { projectKey },
      select: { id: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Invalid project key' },
        { status: 401 }
      )
    }

    // Parse body
    const body = await request.json()
    const events: IngestEvent[] = Array.isArray(body.events) ? body.events : []

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'No events provided' },
        { status: 400 }
      )
    }

    if (events.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 events per request' },
        { status: 400 }
      )
    }

    // Process events
    let accepted = 0
    let rejected = 0
    const requestRecords = []

    for (const event of events) {
      // Validate required fields
      if (!event.provider || !event.model || event.promptTokens == null || event.completionTokens == null) {
        rejected++
        continue
      }

      const totalTokens = event.totalTokens ?? (event.promptTokens + event.completionTokens)
      const cost = event.estimatedCost ?? calculateCost(event.model, event.promptTokens, event.completionTokens)

      requestRecords.push({
        projectId: project.id,
        model: event.model,
        provider: event.provider,
        originalModel: event.originalModel ?? null,
        promptTokens: event.promptTokens,
        completionTokens: event.completionTokens,
        totalTokens,
        cost,
        latencyMs: event.latencyMs ?? null,
        isStreaming: event.isStreaming ?? false,
        status: event.status ?? 'success',
        errorType: event.errorType ?? null,
        statusCode: event.statusCode ?? null,
        tags: event.tags ? JSON.stringify(event.tags) : null,
        userId: event.userId ?? null,
        feature: event.feature ?? null,
        sdkVersion: event.sdkVersion ?? null,
        runtime: event.runtime ?? null,
        createdAt: event.timestamp ? new Date(event.timestamp) : new Date(),
      })

      accepted++
    }

    // Batch insert all valid records
    if (requestRecords.length > 0) {
      await prisma.request.createMany({ data: requestRecords })

      // Update project lastActivityAt
      await prisma.project.update({
        where: { id: project.id },
        data: { lastActivityAt: new Date() },
      })

      // Update daily summary (fire-and-forget, don't block response)
      updateDailySummary(project.id, requestRecords).catch(err =>
        console.error('Failed to update daily summary:', err)
      )
    }

    return NextResponse.json({ accepted, rejected })
  } catch (error) {
    console.error('Ingest error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateDailySummary(
  projectId: string,
  records: Array<{
    cost: number
    totalTokens: number
    promptTokens: number
    completionTokens: number
    latencyMs: number | null
    provider: string
    model: string
  }>
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalCost = records.reduce((sum, r) => sum + r.cost, 0)
  const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0)
  const promptTokens = records.reduce((sum, r) => sum + r.promptTokens, 0)
  const completionTokens = records.reduce((sum, r) => sum + r.completionTokens, 0)

  // Aggregate cost by provider and model
  const costByProvider: Record<string, number> = {}
  const costByModel: Record<string, number> = {}
  for (const r of records) {
    costByProvider[r.provider] = (costByProvider[r.provider] || 0) + r.cost
    costByModel[r.model] = (costByModel[r.model] || 0) + r.cost
  }

  const latencies = records.map(r => r.latencyMs).filter((l): l is number => l != null)
  const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : null

  await prisma.dailySummary.upsert({
    where: { projectId_date: { projectId, date: today } },
    create: {
      projectId,
      date: today,
      totalRequests: records.length,
      totalCost,
      totalTokens,
      promptTokens,
      completionTokens,
      costByProvider: JSON.stringify(costByProvider),
      costByModel: JSON.stringify(costByModel),
      avgLatency,
    },
    update: {
      totalRequests: { increment: records.length },
      totalCost: { increment: totalCost },
      totalTokens: { increment: totalTokens },
      promptTokens: { increment: promptTokens },
      completionTokens: { increment: completionTokens },
      // Note: costByProvider/costByModel merge would need a raw query for proper merge.
      // For now, we'll update them with a simple overwrite approach on the next full recalc.
    },
  })
}
