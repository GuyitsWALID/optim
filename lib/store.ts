import { create } from 'zustand'

// Types
export interface Project {
  id: string
  name: string
  description: string | null
  projectKey: string
  providers: string[]
  models: string[]
  sdkPlatform: string
  totalRequests: number
  totalCost30d: number
  lastActivityAt: string | null
  autoOptimizeEnabled: boolean
  createdAt: string
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
  totalTokens?: number
}

export interface Recommendation {
  id: string
  type: string
  priority: string
  title: string
  description: string
  estimatedSavings?: number
  implementationEffort?: string
  project?: { name: string }
}

export interface AutoOptimizeConfig {
  isEnabled: boolean
  maxSavingsTarget: number
  qualityTolerance: string
  excludedEndpoints?: string
  routingRules?: string
}

export interface RequestLog {
  id: string
  projectId: string
  model: string
  provider: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  latencyMs: number | null
  isStreaming: boolean
  originalModel: string | null
  status: string | null
  errorType: string | null
  feature: string | null
  tags: string | null
  runtime: string | null
  createdAt: string
  project: { name: string }
}

export interface OnboardingData {
  useCases: string[]
  projectType: 'company' | 'personal'
  teamSize?: string
  industry?: string
  role?: string
  usageFrequency?: string
  expertiseLevel?: string
  currentProviders?: string[]
  monthlySpend?: string
}

export type TierName = 'FREE' | 'PRO' | 'ENTERPRISE'

export interface BillingData {
  tier: TierName
  limits: {
    projects: number | null
    requestsPerMonth: number | null
    retentionDays: number | null
    teamSeats: number | null
  }
  usage: {
    projects: number
    requestsThisMonth: number
  }
  subscription: {
    status: string
    periodStart: string | null
    periodEnd: string | null
    whopPlanId: string
  } | null
  manageUrl: string | null
}

interface DashboardState {
  // Organization
  organizationId: string | null

  // User preferences (from onboarding)
  userPreferences: OnboardingData | null
  tier: TierName
  loadingPreferences: boolean

  // Billing
  billing: BillingData | null
  loadingBilling: boolean

  // Projects
  projects: Project[]
  selectedProjectId: string | null
  loadingProjects: boolean

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

  // Requests / usage logs
  requestLogs: RequestLog[]
  requestLogsTotal: number
  loadingRequestLogs: boolean

  // Auto-optimize (per project)
  autoOptimizeConfig: AutoOptimizeConfig | null
  loadingAutoOptimize: boolean

  // Actions
  setOrganizationId: (id: string) => void
  setUserPreferences: (prefs: OnboardingData | null) => void
  fetchUserPreferences: () => Promise<void>
  fetchBilling: () => Promise<void>
  setSelectedProjectId: (id: string | null) => void
  setPeriod: (period: 'day' | 'week' | 'month' | 'year') => void
  fetchProjects: () => Promise<void>
  fetchCosts: () => Promise<void>
  fetchRecommendations: () => Promise<void>
  fetchRequestLogs: (params?: { projectId?: string; limit?: number; offset?: number }) => Promise<void>
  fetchAutoOptimize: (projectId: string) => Promise<void>
  toggleAutoOptimize: (projectId: string, enabled: boolean) => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  organizationId: null,
  userPreferences: null,
  tier: 'FREE',
  loadingPreferences: false,
  billing: null,
  loadingBilling: false,
  projects: [],
  selectedProjectId: null,
  loadingProjects: false,
  period: 'month',
  costSummary: { totalCost: 0, totalRequests: 0, totalTokens: 0 },
  dailyData: [],
  costByModel: [],
  costByProvider: [],
  loadingCosts: false,
  recommendations: [],
  loadingRecommendations: false,
  requestLogs: [],
  requestLogsTotal: 0,
  loadingRequestLogs: false,
  autoOptimizeConfig: null,
  loadingAutoOptimize: false,

  // Actions
  setOrganizationId: (id) => set({ organizationId: id }),
  setUserPreferences: (prefs) => set({ userPreferences: prefs }),

  fetchUserPreferences: async () => {
    set({ loadingPreferences: true })
    try {
      const res = await fetch('/api/v1/user/preferences')
      const data = await res.json()
      if (data.preferences || data.onboardingCompleted) {
        set({ userPreferences: data.preferences })
        if (data.tier) {
          set({ tier: data.tier as TierName })
        }
        if (data.organizationId) {
          set({ organizationId: data.organizationId })
        }
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
    } finally {
      set({ loadingPreferences: false })
    }
  },

  fetchBilling: async () => {
    set({ loadingBilling: true })
    try {
      const res = await fetch('/api/v1/billing')
      const data = await res.json()
      if (data?.tier) {
        set({
          billing: data as BillingData,
          tier: data.tier as TierName,
        })
      }
    } catch (error) {
      console.error('Error fetching billing:', error)
    } finally {
      set({ loadingBilling: false })
    }
  },

  setSelectedProjectId: (id) => {
    set({ selectedProjectId: id })
    // Re-fetch costs and recommendations when project changes
    get().fetchCosts()
    get().fetchRecommendations()
  },

  setPeriod: (period) => {
    set({ period })
    get().fetchCosts()
  },

  fetchProjects: async () => {
    set({ loadingProjects: true })
    try {
      const res = await fetch('/api/v1/projects')
      const data = await res.json()
      set({ projects: data.projects || [] })
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      set({ loadingProjects: false })
    }
  },

  fetchCosts: async () => {
    const { period, selectedProjectId } = get()

    set({ loadingCosts: true })
    try {
      const params = new URLSearchParams({ period })
      if (selectedProjectId) params.set('projectId', selectedProjectId)

      const res = await fetch(`/api/v1/costs?${params}`)
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
    const { selectedProjectId } = get()

    set({ loadingRecommendations: true })
    try {
      const params = new URLSearchParams()
      if (selectedProjectId) params.set('projectId', selectedProjectId)

      const res = await fetch(`/api/v1/recommendations?${params}`)
      const data = await res.json()
      set({ recommendations: data.recommendations || [] })
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      set({ loadingRecommendations: false })
    }
  },

  fetchRequestLogs: async (params) => {
    set({ loadingRequestLogs: true })
    try {
      const searchParams = new URLSearchParams()
      if (params?.projectId) searchParams.set('projectId', params.projectId)
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.offset) searchParams.set('offset', String(params.offset))

      const res = await fetch(`/api/v1/requests?${searchParams}`)
      const data = await res.json()
      set({ requestLogs: data.requests || [], requestLogsTotal: data.total || 0 })
    } catch (error) {
      console.error('Error fetching request logs:', error)
    } finally {
      set({ loadingRequestLogs: false })
    }
  },

  fetchAutoOptimize: async (projectId: string) => {
    set({ loadingAutoOptimize: true })
    try {
      const res = await fetch(`/api/v1/auto-optimize?projectId=${projectId}`)
      const data = await res.json()
      set({ autoOptimizeConfig: data.config || null })
    } catch (error) {
      console.error('Error fetching auto-optimize config:', error)
    } finally {
      set({ loadingAutoOptimize: false })
    }
  },

  toggleAutoOptimize: async (projectId: string, enabled: boolean) => {
    const { autoOptimizeConfig } = get()
    try {
      const res = await fetch('/api/v1/auto-optimize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
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
}))
