import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionWithOrg } from '@/lib/api-auth'
import { getRetentionCutoffDate } from '@/lib/tier-limits'

// GET /api/v1/costs — Get cost summary (optionally scoped to a project)
export async function GET(request: Request) {
  const { organizationId, tier, response } = await requireSessionWithOrg(request)
  if (response) return response

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const period = searchParams.get('period') || 'month'

  // Calculate date range
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const retentionCutoff = getRetentionCutoffDate(tier!)
  if (retentionCutoff && retentionCutoff > startDate) {
    startDate = retentionCutoff
  }

  // Build where clause — project-scoped or all projects in org
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
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      summary: { totalCost: 0, totalRequests: 0, totalTokens: 0 },
      costByModel: [],
      costByProvider: [],
      daily: [],
    })
  }

  const where = {
    projectId: { in: projectIds },
    createdAt: { gte: startDate },
  }

  const [totalCost, totalRequests, totalTokens, costByModel, costByProvider] =
    await Promise.all([
      prisma.request.aggregate({ where, _sum: { cost: true } }),
      prisma.request.count({ where }),
      prisma.request.aggregate({ where, _sum: { totalTokens: true } }),
      prisma.request.groupBy({
        by: ['model'],
        where,
        _sum: { cost: true },
        _count: true,
        orderBy: { _sum: { cost: 'desc' } },
        take: 10,
      }),
      prisma.request.groupBy({
        by: ['provider'],
        where,
        _sum: { cost: true },
        orderBy: { _sum: { cost: 'desc' } },
      }),
    ])

  // Get daily summaries
  const dailyData = await prisma.dailySummary.findMany({
    where: {
      projectId: { in: projectIds },
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
  })

  // Aggregate daily data across projects if multiple
  const dailyMap = new Map<
    string,
    { date: string; totalCost: number; totalRequests: number; totalTokens: number }
  >()
  for (const d of dailyData) {
    const key = d.date.toISOString().split('T')[0]
    const existing = dailyMap.get(key) || {
      date: key,
      totalCost: 0,
      totalRequests: 0,
      totalTokens: 0,
    }
    existing.totalCost += d.totalCost
    existing.totalRequests += d.totalRequests
    existing.totalTokens += d.totalTokens
    dailyMap.set(key, existing)
  }

  return NextResponse.json({
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    summary: {
      totalCost: totalCost._sum.cost || 0,
      totalRequests,
      totalTokens: totalTokens._sum.totalTokens || 0,
    },
    costByModel: costByModel.map((m) => ({
      model: m.model,
      cost: m._sum.cost || 0,
      requests: m._count,
    })),
    costByProvider: costByProvider.map((p) => ({
      provider: p.provider,
      cost: p._sum.cost || 0,
    })),
    daily: Array.from(dailyMap.values()),
  })
}
