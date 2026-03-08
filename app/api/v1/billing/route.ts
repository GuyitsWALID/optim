import { NextResponse } from 'next/server'
import { requireSessionWithOrg } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { TIER_LIMITS } from '@/lib/tier-limits'
import { getWhopClient } from '@/lib/whop'

function getMonthStartDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export async function GET(request: Request) {
  const { organizationId, tier, response } = await requireSessionWithOrg(request)
  if (response) return response

  const [projectCount, requestCountThisMonth, subscription] = await Promise.all([
    prisma.project.count({ where: { organizationId: organizationId! } }),
    prisma.request.count({
      where: {
        project: { organizationId: organizationId! },
        createdAt: { gte: getMonthStartDate() },
      },
    }),
    prisma.subscription.findUnique({
      where: { organizationId: organizationId! },
    }),
  ])

  const limits = TIER_LIMITS[tier!]

  return NextResponse.json({
    tier,
    limits,
    usage: {
      projects: projectCount,
      requestsThisMonth: requestCountThisMonth,
    },
    subscription: subscription
      ? {
          status: subscription.status,
          periodStart: subscription.periodStart,
          periodEnd: subscription.periodEnd,
          whopPlanId: subscription.whopPlanId,
        }
      : null,
    manageUrl: await getManageUrl(subscription?.whopMembershipId),
  })
}

async function getManageUrl(whopMembershipId: string | null | undefined): Promise<string | null> {
  if (!whopMembershipId) return null
  try {
    const whop = getWhopClient()
    const membership = await whop.memberships.retrieve(whopMembershipId)
    return membership.manage_url ?? null
  } catch {
    return null
  }
}
