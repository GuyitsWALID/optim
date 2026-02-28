'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { StatCard } from '@/components/dashboard/StatCard'
import { CostChart, CostByModel, CostByProvider } from '@/components/dashboard/Charts'
import { ApiKeysManager } from '@/components/dashboard/ApiKeysManager'
import { AutoOptimizeToggle } from '@/components/dashboard/AutoOptimizeToggle'
import { RecommendationsPanel } from '@/components/dashboard/RecommendationsPanel'
import { useDashboardStore } from '@/lib/store'
import { Calendar } from 'lucide-react'

export default function DashboardPage() {
  const {
    period,
    setPeriod,
    costSummary,
    dailyData,
    costByModel,
    costByProvider,
    loadingCosts,
    fetchCosts,
    fetchApiKeys,
    fetchAutoOptimize,
    fetchRecommendations,
    fetchUserPreferences,
    userPreferences,
  } = useDashboardStore()

  useEffect(() => {
    fetchUserPreferences().then(() => {
      fetchCosts()
      fetchApiKeys()
      fetchAutoOptimize()
      fetchRecommendations()
    })
  }, [])

  // Determine UI complexity based on expertise level
  const isAdvanced = userPreferences?.expertiseLevel === 'advanced'
  const isBeginner = userPreferences?.expertiseLevel === 'beginner'
  const isPersonal = userPreferences?.projectType === 'personal'

  // Reorder panels based on use cases
  const showCostOptimization = userPreferences?.useCases?.includes('cost-optimization')
  const showBenchmarking = userPreferences?.useCases?.includes('benchmarking')

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value.toFixed(2)}`
  }

  const formatTokens = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  // Personalized welcome message
  const getWelcomeMessage = () => {
    if (isPersonal) {
      return {
        title: 'Your Personal Dashboard',
        subtitle: 'Track your LLM usage and costs'
      }
    }
    if (showCostOptimization) {
      return {
        title: 'Cost Optimization Dashboard',
        subtitle: 'Monitor and reduce your AI spending'
      }
    }
    return {
      title: 'Dashboard Overview',
      subtitle: 'Your AI spending at a glance'
    }
  }

  const welcome = getWelcomeMessage()

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
          title="Avg Cost/Request"
          value={costSummary.totalRequests > 0
            ? `$${(costSummary.totalCost / costSummary.totalRequests).toFixed(4)}`
            : '$0.0000'}
          subtitle="This period"
          icon="clock"
        />
      </div>

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
          <AutoOptimizeToggle />
        </div>
      </div>

      {/* Third row - API Keys and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApiKeysManager />
        <RecommendationsPanel />
      </div>
    </div>
  )
}
