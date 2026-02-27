import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/v1/costs - Get cost summary
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const period = searchParams.get('period') || 'month' // day, week, month, year

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

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

    // Get aggregated data
    const [totalCost, totalRequests, totalTokens, costByModel, costByProvider] = await Promise.all([
      prisma.request.aggregate({
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
        _sum: { cost: true },
      }),
      prisma.request.count({
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
      }),
      prisma.request.aggregate({
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
        _sum: { totalTokens: true },
      }),
      prisma.request.groupBy({
        by: ['model'],
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
        _sum: { cost: true },
        _count: true,
        orderBy: { _sum: { cost: 'desc' } },
        take: 10,
      }),
      prisma.request.groupBy({
        by: ['provider'],
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
        _sum: { cost: true },
        orderBy: { _sum: { cost: 'desc' } },
      }),
    ])

    // Get daily breakdown
    const dailyData = await prisma.dailySummary.findMany({
      where: {
        organizationId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      summary: {
        totalCost: totalCost._sum.cost || 0,
        totalRequests,
        totalTokens: totalTokens._sum.totalTokens || 0,
      },
      costByModel: costByModel.map(m => ({
        model: m.model,
        cost: m._sum.cost || 0,
        requests: m._count,
      })),
      costByProvider: costByProvider.map(p => ({
        provider: p.provider,
        cost: p._sum.cost || 0,
      })),
      daily: dailyData,
    })
  } catch (error) {
    console.error('Error fetching costs:', error)
    return NextResponse.json({ error: 'Failed to fetch costs' }, { status: 500 })
  }
}
