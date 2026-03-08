import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasMinimumTier } from '@/lib/tier-limits'
import { Tier } from '@prisma/client'
import { NextResponse } from 'next/server'

/**
 * Get the authenticated user's session from a request.
 * Tries cookie-based auth first, then Bearer token.
 */
export async function getSessionFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization')
  let session = null

  // Try cookie-based auth
  session = await auth.api.getSession({
    headers: request.headers,
  })

  // Fallback to Bearer token
  if (!session?.user && authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    session = await auth.api.getSession({
      headers: new Headers({ Authorization: `Bearer ${token}` }),
    })
  }

  return session
}

/**
 * Require an authenticated session, returning a 401 response if not found.
 * Returns { session, response } — if response is set, return it immediately.
 */
export async function requireSession(request: Request) {
  const session = await getSessionFromRequest(request)

  if (!session?.user) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { session, response: null }
}

/**
 * Get the user's organization ID from their profile.
 */
export async function getUserOrganizationId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  })
  return user?.organizationId ?? null
}

/**
 * Require session + organization, returning error responses if missing.
 */
export async function requireSessionWithOrg(request: Request) {
  const { session, response } = await requireSession(request)
  if (response) return { session: null, organizationId: null, tier: null, response }

  const organizationId = await getUserOrganizationId(session!.user.id)
  if (!organizationId) {
    return {
      session: null,
      organizationId: null,
      tier: null,
      response: NextResponse.json(
        { error: 'No organization found. Complete onboarding first.' },
        { status: 403 }
      ),
    }
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { tier: true },
  })

  if (!organization) {
    return {
      session: null,
      organizationId: null,
      tier: null,
      response: NextResponse.json({ error: 'Organization not found' }, { status: 404 }),
    }
  }

  return { session, organizationId, tier: organization.tier, response: null }
}

export function requireTier(currentTier: Tier, minimumTier: Tier) {
  if (hasMinimumTier(currentTier, minimumTier)) {
    return null
  }

  return NextResponse.json(
    {
      error: `This feature requires ${minimumTier} tier or higher`,
      requiredTier: minimumTier,
      currentTier,
    },
    { status: 403 }
  )
}

/**
 * Generate a project key: opt_proj_ + 24 random hex chars
 */
export function generateProjectKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'opt_proj_'
  for (let i = 0; i < 24; i++) {
    key += chars[Math.floor(Math.random() * chars.length)]
  }
  return key
}
