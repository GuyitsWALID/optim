'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatCard } from '@/components/dashboard/StatCard'
import { CostChart, CostByModel, CostByProvider } from '@/components/dashboard/Charts'
import { RecommendationsPanel } from '@/components/dashboard/RecommendationsPanel'
import { useDashboardStore } from '@/lib/store'
import { Calendar, FolderKanban, ArrowRight, Shield } from 'lucide-react'
import { useSession } from '@/lib/useSession'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { user } = useSession()
  const {
    period,
    setPeriod,
    costSummary,
    dailyData,
    costByModel,
    costByProvider,
    loadingCosts,
    fetchCosts,
    fetchProjects,
    projects,
    fetchRecommendations,
    fetchUserPreferences,
    userPreferences,
    billing,
    fetchBilling,
  } = useDashboardStore()

  useEffect(() => {
    setMounted(true)

    const checkOnboarding = async () => {
      try {
        const res = await fetch('/api/v1/user/preferences')
        const data = await res.json()

        if (!data.onboardingCompleted && !data.preferences) {
          window.location.href = '/onboarding'
          return
        }

        fetchUserPreferences().then(() => {
          fetchCosts()
          fetchProjects()
          fetchRecommendations()
          fetchBilling()
        })
      } catch (error) {
        console.error('Error checking onboarding:', error)
      }
    }

    checkOnboarding()
  }, [])

  const isPersonal = userPreferences?.projectType === 'personal'
  const showCostOptimization = userPreferences?.useCases?.includes('cost-optimization')

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toFixed(2)}`
  }

  const formatTokens = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  const getWelcomeMessage = () => {
    const firstName = user?.name?.split(' ')[0] || ''
    const greeting = firstName ? `Welcome back, ${firstName}` : 'Welcome back'

    if (isPersonal) {
      return { title: greeting, subtitle: 'Track your LLM usage and costs' }
    }
    if (showCostOptimization) {
      return { title: greeting, subtitle: 'Monitor and reduce your AI spending' }
    }
    return { title: greeting, subtitle: 'Your AI spending at a glance' }
  }

  const welcome = getWelcomeMessage()

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{welcome.title}</h1>
        <p className="text-[var(--foreground-secondary)]">{welcome.subtitle}</p>
      </div>

      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--foreground-muted)]" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month' | 'year')}
            className="input-field"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Spend"
          value={formatCurrency(costSummary.totalCost)}
          subtitle="This period"
          icon="dollar"
        />
        <StatCard
          title="API Requests"
          value={costSummary.totalRequests.toLocaleString()}
          subtitle="This period"
          icon="activity"
        />
        <StatCard
          title="Tokens Used"
          value={formatTokens(costSummary.totalTokens)}
          subtitle="This period"
          icon="zap"
        />
        <StatCard
          title="Active Projects"
          value={projects.length.toString()}
          subtitle="With SDK integration"
          icon="clock"
        />
      </div>

      {billing && (
        <div className="bento-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: billing.tier === 'FREE' ? 'var(--foreground-muted)' : 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
                Monthly usage
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: billing.tier === 'FREE' ? 'var(--surface-secondary)' : 'var(--accent)',
                  color: billing.tier === 'FREE' ? 'var(--foreground-muted)' : '#fff',
                }}
              >
                {billing.tier}
              </span>
            </div>
            <span className="text-sm">
              {billing.usage.requestsThisMonth.toLocaleString()}
              {billing.limits.requestsPerMonth ? ` / ${billing.limits.requestsPerMonth.toLocaleString()} requests` : ' requests'}
            </span>
          </div>
          {billing.limits.requestsPerMonth ? (
            <div className="w-full h-3 rounded-full" style={{ background: 'var(--surface-secondary)' }}>
              {(() => {
                const pct = Math.min(100, (billing.usage.requestsThisMonth / billing.limits.requestsPerMonth) * 100)
                const color = pct > 90 ? 'var(--error)' : pct >= 70 ? 'var(--warning)' : 'var(--success, #22c55e)'
                return (
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                )
              })()}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              Unlimited requests on your current plan.
            </p>
          )}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CostChart data={dailyData} />
        </div>
        <div>
          <CostByProvider data={costByProvider} />
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CostByModel data={costByModel} />
        </div>
        <div>
          <RecommendationsPanel />
        </div>
      </div>

      {/* Projects summary */}
      {projects.length > 0 && (
        <div className="bento-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold">Projects</h3>
            <Link
              href="/dashboard/projects"
              className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FolderKanban className="w-5 h-5 text-[var(--accent)]" />
                  <span className="font-medium">{project.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
                  <span>{project.totalRequests.toLocaleString()} requests</span>
                  <span className="text-[var(--accent)]">{formatCurrency(project.totalCost30d)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
