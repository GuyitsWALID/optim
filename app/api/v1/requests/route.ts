import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionWithOrg } from '@/lib/api-auth'

// GET /api/v1/requests — Get recent requests (session auth, project-scoped)
export async function GET(request: Request) {
  const { organizationId, response } = await requireSessionWithOrg(request)
  if (response) return response

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
  const offset = parseInt(searchParams.get('offset') || '0')

  // If projectId given, use it directly; otherwise get all project IDs in org
  const projectIds = projectId
    ? [projectId]
    : (
        await prisma.project.findMany({
          where: { organizationId: organizationId! },
          select: { id: true },
        })
      ).map((p) => p.id)

  if (projectIds.length === 0) {
    return NextResponse.json({ requests: [], total: 0, limit, offset })
  }

  const where = { projectId: { in: projectIds } }

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        projectId: true,
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
        errorType: true,
        feature: true,
        tags: true,
        runtime: true,
        createdAt: true,
        project: { select: { name: true } },
      },
    }),
    prisma.request.count({ where }),
  ])

  return NextResponse.json({ requests, total, limit, offset })
}
