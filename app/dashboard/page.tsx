'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatCard } from '@/components/dashboard/StatCard'
import { CostChart, CostByModel, CostByProvider } from '@/components/dashboard/Charts'
import { ApiKeysManager } from '@/components/dashboard/ApiKeysManager'
import { AutoOptimizeToggle } from '@/components/dashboard/AutoOptimizeToggle'
import { RecommendationsPanel } from '@/components/dashboard/RecommendationsPanel'
import { useDashboardStore } from '@/lib/store'
import { Calendar } from 'lucide-react'
import { createAuthClient } from 'better-auth/react'

// Auth client singleton
let authClient: ReturnType<typeof createAuthClient> | null = null

function getAuthClient() {
  if (!authClient) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    authClient = createAuthClient({
      baseURL: `${baseUrl}/api/auth`,
    })
  }
  return authClient
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
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
    setMounted(true)

    // Check if user has completed onboarding
    const checkOnboarding = async () => {
      try {
        const res = await fetch('/api/v1/user/preferences')
        const data = await res.json()
        console.log('Onboarding check response:', data)

        // If onboarding not completed, redirect to onboarding
        if (!data.onboardingCompleted && !data.preferences) {
          console.log('Onboarding not completed, redirecting...')
          window.location.href = '/onboarding'
          return
        }

        console.log('Onboarding completed, loading dashboard...')
        // If completed, fetch the dashboard data
        fetchUserPreferences().then(() => {
          fetchCosts()
          fetchApiKeys()
          fetchAutoOptimize()
          fetchRecommendations()
        })
      } catch (error) {
        console.error('Error checking onboarding:', error)
      }
    }

    checkOnboarding()
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

  if (!mounted) {
    return null
  }

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
