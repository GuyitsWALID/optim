import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionWithOrg, requireTier } from '@/lib/api-auth'
import { Tier } from '@prisma/client'

// GET /api/v1/auto-optimize?projectId=... — Get auto-optimize config for a project
export async function GET(request: Request) {
  const { tier, response } = await requireSessionWithOrg(request)
  if (response) return response

  const tierResponse = requireTier(tier!, Tier.PRO)
  if (tierResponse) return tierResponse

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  let config = await prisma.autoOptimizeConfig.findUnique({
    where: { projectId },
  })

  // Create default config if doesn't exist
  if (!config) {
    config = await prisma.autoOptimizeConfig.create({
      data: {
        projectId,
        isEnabled: false,
        maxSavingsTarget: 0.3,
        qualityTolerance: 'moderate',
      },
    })
  }

  return NextResponse.json({ config })
}

// PUT /api/v1/auto-optimize — Update auto-optimize config for a project
export async function PUT(request: Request) {
  const { tier, response } = await requireSessionWithOrg(request)
  if (response) return response

  const tierResponse = requireTier(tier!, Tier.PRO)
  if (tierResponse) return tierResponse

  const body = await request.json()
  const { projectId, isEnabled, maxSavingsTarget, qualityTolerance, excludedEndpoints, routingRules } = body

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  const config = await prisma.autoOptimizeConfig.upsert({
    where: { projectId },
    update: {
      ...(isEnabled !== undefined && { isEnabled }),
      ...(maxSavingsTarget !== undefined && { maxSavingsTarget }),
      ...(qualityTolerance !== undefined && { qualityTolerance }),
      ...(excludedEndpoints !== undefined && { excludedEndpoints }),
      ...(routingRules !== undefined && { routingRules: JSON.stringify(routingRules) }),
    },
    create: {
      projectId,
      isEnabled: isEnabled ?? false,
      maxSavingsTarget: maxSavingsTarget ?? 0.3,
      qualityTolerance: qualityTolerance ?? 'moderate',
      excludedEndpoints: excludedEndpoints ?? null,
      routingRules: routingRules ? JSON.stringify(routingRules) : null,
    },
  })

  return NextResponse.json({ config })
}
