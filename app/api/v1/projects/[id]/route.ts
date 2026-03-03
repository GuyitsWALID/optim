import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionWithOrg } from '@/lib/api-auth'

// GET /api/v1/projects/[id] — Get project details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { organizationId, response } = await requireSessionWithOrg(request)
  if (response) return response

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      autoOptimize: true,
      _count: { select: { requests: true } },
    },
  })

  if (!project || project.organizationId !== organizationId) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Get cost stats for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [costAgg, recentRequests, dailySummaries] = await Promise.all([
    prisma.request.aggregate({
      where: { projectId: project.id, createdAt: { gte: thirtyDaysAgo } },
      _sum: { cost: true, totalTokens: true },
      _avg: { latencyMs: true },
    }),
    prisma.request.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        model: true,
        provider: true,
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        cost: true,
        latencyMs: true,
        isStreaming: true,
        originalModel: true,
        status: true,
        feature: true,
        createdAt: true,
      },
    }),
    prisma.dailySummary.findMany({
      where: { projectId: project.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' },
    }),
  ])

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      projectKey: project.projectKey,
      providers: JSON.parse(project.providers),
      models: JSON.parse(project.models),
      sdkPlatform: project.sdkPlatform,
      lastActivityAt: project.lastActivityAt,
      autoOptimize: project.autoOptimize,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    stats: {
      totalRequests: project._count.requests,
      totalCost30d: costAgg._sum.cost ?? 0,
      totalTokens30d: costAgg._sum.totalTokens ?? 0,
      avgLatency: costAgg._avg.latencyMs ?? null,
    },
    recentRequests,
    dailySummaries: dailySummaries.map((s) => ({
      date: s.date,
      totalRequests: s.totalRequests,
      totalCost: s.totalCost,
      totalTokens: s.totalTokens,
      costByProvider: s.costByProvider ? JSON.parse(s.costByProvider) : {},
      costByModel: s.costByModel ? JSON.parse(s.costByModel) : {},
      avgLatency: s.avgLatency,
    })),
  })
}

// PUT /api/v1/projects/[id] — Update project details
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { organizationId, response } = await requireSessionWithOrg(request)
  if (response) return response

  const { id } = await params

  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing || existing.organizationId !== organizationId) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const body = await request.json()
  const { name, description, providers, models, sdkPlatform } = body

  const updateData: Record<string, unknown> = {}
  if (name) updateData.name = name
  if (description !== undefined) updateData.description = description || null
  if (providers && Array.isArray(providers)) updateData.providers = JSON.stringify(providers)
  if (models && Array.isArray(models)) updateData.models = JSON.stringify(models)
  if (sdkPlatform && ['nodejs', 'python', 'rest'].includes(sdkPlatform)) {
    updateData.sdkPlatform = sdkPlatform
  }

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      providers: JSON.parse(project.providers),
      models: JSON.parse(project.models),
      sdkPlatform: project.sdkPlatform,
      updatedAt: project.updatedAt,
    },
  })
}

// DELETE /api/v1/projects/[id] — Delete a project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { organizationId, response } = await requireSessionWithOrg(request)
  if (response) return response

  const { id } = await params

  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing || existing.organizationId !== organizationId) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  await prisma.project.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
