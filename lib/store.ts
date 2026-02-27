import { create } from 'zustand'

// Types
export interface ApiKey {
  id: string
  name: string | null
  provider: string
  lastUsedAt: string | null
  createdAt: string
  _count: {
    requests: number
  }
}

export interface CostSummary {
  totalCost: number
  totalRequests: number
  totalTokens: number
}

export interface DailyData {
  date: string
  totalCost: number
  totalRequests: number
}

export interface Recommendation {
  id: string
  type: string
  priority: string
  title: string
  description: string
  estimatedSavings?: number
  implementationEffort?: string
}

export interface AutoOptimizeConfig {
  isEnabled: boolean
  maxSavingsTarget: number
  qualityTolerance: string
  excludedEndpoints?: string
}

interface DashboardState {
  // Organization
  organizationId: string | null

  // API Keys
  apiKeys: ApiKey[]
  loadingKeys: boolean

  // Costs
  period: 'day' | 'week' | 'month' | 'year'
  costSummary: CostSummary
  dailyData: DailyData[]
  costByModel: { model: string; cost: number; requests: number }[]
  costByProvider: { provider: string; cost: number }[]
  loadingCosts: boolean

  // Recommendations
  recommendations: Recommendation[]
  loadingRecommendations: boolean

  // Auto-optimize
  autoOptimizeConfig: AutoOptimizeConfig | null
  loadingAutoOptimize: boolean

  // Actions
  setOrganizationId: (id: string) => void
  setPeriod: (period: 'day' | 'week' | 'month' | 'year') => void
  fetchApiKeys: () => Promise<void>
  fetchCosts: () => Promise<void>
  fetchRecommendations: () => Promise<void>
  fetchAutoOptimize: () => Promise<void>
  toggleAutoOptimize: (enabled: boolean) => Promise<void>
  addApiKey: (key: string, provider: string, name?: string) => Promise<void>
  deleteApiKey: (id: string) => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  organizationId: 'demo-org', // Default for demo
  apiKeys: [],
  loadingKeys: false,
  period: 'month',
  costSummary: { totalCost: 0, totalRequests: 0, totalTokens: 0 },
  dailyData: [],
  costByModel: [],
  costByProvider: [],
  loadingCosts: false,
  recommendations: [],
  loadingRecommendations: false,
  autoOptimizeConfig: null,
  loadingAutoOptimize: false,

  // Actions
  setOrganizationId: (id) => set({ organizationId: id }),

  setPeriod: (period) => {
    set({ period })
    get().fetchCosts()
  },

  fetchApiKeys: async () => {
    const { organizationId } = get()
    if (!organizationId) return

    set({ loadingKeys: true })
    try {
      const res = await fetch(`/api/v1/keys?organizationId=${organizationId}`)
      const data = await res.json()
      set({ apiKeys: data.apiKeys || [] })
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      set({ loadingKeys: false })
    }
  },

  fetchCosts: async () => {
    const { organizationId, period } = get()
    if (!organizationId) return

    set({ loadingCosts: true })
    try {
      const res = await fetch(`/api/v1/costs?organizationId=${organizationId}&period=${period}`)
      const data = await res.json()
      set({
        costSummary: data.summary || { totalCost: 0, totalRequests: 0, totalTokens: 0 },
        dailyData: data.daily || [],
        costByModel: data.costByModel || [],
        costByProvider: data.costByProvider || [],
      })
    } catch (error) {
      console.error('Error fetching costs:', error)
    } finally {
      set({ loadingCosts: false })
    }
  },

  fetchRecommendations: async () => {
    const { organizationId } = get()
    if (!organizationId) return

    set({ loadingRecommendations: true })
    try {
      const res = await fetch(`/api/v1/recommendations?organizationId=${organizationId}`)
      const data = await res.json()
      set({ recommendations: data.recommendations || [] })
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      set({ loadingRecommendations: false })
    }
  },

  fetchAutoOptimize: async () => {
    const { organizationId } = get()
    if (!organizationId) return

    set({ loadingAutoOptimize: true })
    try {
      const res = await fetch(`/api/v1/auto-optimize?organizationId=${organizationId}`)
      const data = await res.json()
      set({ autoOptimizeConfig: data.config || null })
    } catch (error) {
      console.error('Error fetching auto-optimize config:', error)
    } finally {
      set({ loadingAutoOptimize: false })
    }
  },

  toggleAutoOptimize: async (enabled) => {
    const { organizationId, autoOptimizeConfig } = get()
    if (!organizationId) return

    try {
      const res = await fetch('/api/v1/auto-optimize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          isEnabled: enabled,
          maxSavingsTarget: autoOptimizeConfig?.maxSavingsTarget || 0.3,
          qualityTolerance: autoOptimizeConfig?.qualityTolerance || 'moderate',
        }),
      })
      const data = await res.json()
      set({ autoOptimizeConfig: data.config })
    } catch (error) {
      console.error('Error toggling auto-optimize:', error)
    }
  },

  addApiKey: async (key, provider, name) => {
    const { organizationId, fetchApiKeys } = get()
    if (!organizationId) return

    try {
      await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, key, provider, name }),
      })
      await fetchApiKeys()
    } catch (error) {
      console.error('Error adding API key:', error)
    }
  },

  deleteApiKey: async (id) => {
    const { fetchApiKeys } = get()
    try {
      await fetch(`/api/v1/keys?id=${id}`, { method: 'DELETE' })
      await fetchApiKeys()
    } catch (error) {
      console.error('Error deleting API key:', error)
    }
  },
}))
