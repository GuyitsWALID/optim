import { NextResponse } from 'next/server'
import { SubscriptionStatus, Tier } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getWhopClient } from '@/lib/whop'

type WhopWebhookEvent = {
  type: string
  data?: {
    id?: string
    metadata?: Record<string, unknown> | null
    user?: {
      id?: string | null
      email?: string | null
    } | null
    plan?: {
      id?: string | null
    } | null
    company?: {
      id?: string | null
    } | null
    access_pass?: {
      id?: string | null
      status?: string | null
      valid_from?: string | null
      valid_until?: string | null
      plan?: { id?: string | null } | null
    } | null
    status?: string | null
    starts_at?: string | null
    expires_at?: string | null
  }
}

function toDate(value?: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getMetadataValue(metadata: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = metadata?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

async function resolveOrganizationId(event: WhopWebhookEvent): Promise<string | null> {
  const metadata = event.data?.metadata
  const organizationIdFromMetadata = getMetadataValue(metadata, 'organizationId')
  if (organizationIdFromMetadata) return organizationIdFromMetadata

  const userIdFromMetadata = getMetadataValue(metadata, 'userId')
  if (userIdFromMetadata) {
    const user = await prisma.user.findUnique({
      where: { id: userIdFromMetadata },
      select: { organizationId: true },
    })
    if (user?.organizationId) return user.organizationId
  }

  const emailFromMetadata = getMetadataValue(metadata, 'email') || event.data?.user?.email || null
  if (emailFromMetadata) {
    const user = await prisma.user.findUnique({
      where: { email: emailFromMetadata },
      select: { organizationId: true },
    })
    if (user?.organizationId) return user.organizationId
  }

  return null
}

async function maybeLinkWhopUser(event: WhopWebhookEvent) {
  const whopUserId = event.data?.user?.id
  const email = event.data?.user?.email
  if (!whopUserId || !email) return

  await prisma.user.updateMany({
    where: { email, whopUserId: null },
    data: { whopUserId },
  })
}

async function upsertSubscriptionForOrg(params: {
  organizationId: string
  whopMembershipId: string
  whopPlanId: string
  status: SubscriptionStatus
  periodStart?: Date | null
  periodEnd?: Date | null
  tier: Tier
}) {
  const { organizationId, whopMembershipId, whopPlanId, status, periodStart, periodEnd, tier } = params

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { organizationId },
      update: {
        whopMembershipId,
        whopPlanId,
        status,
        periodStart: periodStart ?? null,
        periodEnd: periodEnd ?? null,
      },
      create: {
        organizationId,
        whopMembershipId,
        whopPlanId,
        status,
        periodStart: periodStart ?? null,
        periodEnd: periodEnd ?? null,
      },
    }),
    prisma.organization.update({
      where: { id: organizationId },
      data: { tier },
    }),
  ])
}

export async function POST(request: Request) {
  const rawBody = await request.text()

  try {
    const whop = getWhopClient()
    const headers = Object.fromEntries(request.headers.entries())
    const event = whop.webhooks.unwrap(rawBody, { headers }) as unknown as WhopWebhookEvent

    await maybeLinkWhopUser(event)

    const organizationId = await resolveOrganizationId(event)
    if (!organizationId) {
      return NextResponse.json({ received: true, skipped: true, reason: 'organization_not_found' })
    }

    const planId =
      event.data?.plan?.id ||
      event.data?.access_pass?.plan?.id ||
      getMetadataValue(event.data?.metadata, 'planId') ||
      'unknown'

    const membershipId = event.data?.access_pass?.id || event.data?.id || `evt_${Date.now()}`
    const periodStart = toDate(event.data?.access_pass?.valid_from || event.data?.starts_at)
    const periodEnd = toDate(event.data?.access_pass?.valid_until || event.data?.expires_at)

    switch (event.type) {
      case 'payment.succeeded':
      case 'membership.activated': {
        await upsertSubscriptionForOrg({
          organizationId,
          whopMembershipId: membershipId,
          whopPlanId: planId,
          status: SubscriptionStatus.ACTIVE,
          periodStart,
          periodEnd,
          tier: Tier.PRO,
        })
        break
      }
      case 'invoice.past_due': {
        await upsertSubscriptionForOrg({
          organizationId,
          whopMembershipId: membershipId,
          whopPlanId: planId,
          status: SubscriptionStatus.PAST_DUE,
          periodStart,
          periodEnd,
          tier: Tier.PRO,
        })
        break
      }
      case 'membership.deactivated': {
        await upsertSubscriptionForOrg({
          organizationId,
          whopMembershipId: membershipId,
          whopPlanId: planId,
          status: SubscriptionStatus.CANCELED,
          periodStart,
          periodEnd,
          tier: Tier.FREE,
        })
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Whop webhook error:', error)
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
  }
}
