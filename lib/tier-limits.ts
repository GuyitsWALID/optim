import { Tier } from '@prisma/client'

export type TierLimit = {
  projects: number | null
  requestsPerMonth: number | null
  retentionDays: number | null
  teamSeats: number | null
  recommendations: 'none' | 'weekly' | 'realtime'
  autoOptimize: boolean
  alertsAndBudgets: boolean
  benchmarking: boolean
}

export const TIER_LIMITS: Record<Tier, TierLimit> = {
  FREE: {
    projects: 1,
    requestsPerMonth: 10000,
    retentionDays: 7,
    teamSeats: 1,
    recommendations: 'none',
    autoOptimize: false,
    alertsAndBudgets: false,
    benchmarking: false,
  },
  PRO: {
    projects: 10,
    requestsPerMonth: 500000,
    retentionDays: 90,
    teamSeats: 3,
    recommendations: 'weekly',
    autoOptimize: true,
    alertsAndBudgets: true,
    benchmarking: true,
  },
  ENTERPRISE: {
    projects: null,
    requestsPerMonth: null,
    retentionDays: 365,
    teamSeats: null,
    recommendations: 'realtime',
    autoOptimize: true,
    alertsAndBudgets: true,
    benchmarking: true,
  },
}

const TIER_ORDER: Record<Tier, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
}

export function hasMinimumTier(currentTier: Tier, minimumTier: Tier): boolean {
  return TIER_ORDER[currentTier] >= TIER_ORDER[minimumTier]
}

export function checkFeatureAccess(tier: Tier, feature: keyof TierLimit): boolean {
  const value = TIER_LIMITS[tier][feature]
  if (typeof value === 'boolean') return value
  return value !== 'none'
}

export function checkUsageLimit(
  tier: Tier,
  usageType: 'projects' | 'requestsPerMonth' | 'teamSeats',
  currentUsage: number,
  increment = 1
): { allowed: boolean; limit: number | null; nextUsage: number } {
  const limit = TIER_LIMITS[tier][usageType]
  const nextUsage = currentUsage + increment

  if (limit == null) {
    return { allowed: true, limit: null, nextUsage }
  }

  return {
    allowed: nextUsage <= limit,
    limit,
    nextUsage,
  }
}

export function getRetentionCutoffDate(tier: Tier): Date | null {
  const days = TIER_LIMITS[tier].retentionDays
  if (days == null) return null

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return cutoff
}
