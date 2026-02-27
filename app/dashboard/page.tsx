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
  } = useDashboardStore()

  useEffect(() => {
    fetchCosts()
    fetchApiKeys()
    fetchAutoOptimize()
    fetchRecommendations()
  }, [])

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

  return (
    <div className="space-y-6">
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
