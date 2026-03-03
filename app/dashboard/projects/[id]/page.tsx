'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Copy,
  Check,
  Activity,
  DollarSign,
  Zap,
  Clock,
  Settings,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { CostChart, CostByModel, CostByProvider } from '@/components/dashboard/Charts'
import { AutoOptimizeToggle } from '@/components/dashboard/AutoOptimizeToggle'
import { StatCard } from '@/components/dashboard/StatCard'
import { ProviderIcon } from '@/components/dashboard/ProviderIcon'

interface ProjectDetail {
  id: string
  name: string
  description: string | null
  projectKey: string
  providers: string[]
  models: string[]
  sdkPlatform: string
  lastActivityAt: string | null
  autoOptimize: { isEnabled: boolean } | null
  createdAt: string
}

interface ProjectStats {
  totalRequests: number
  totalCost30d: number
  totalTokens30d: number
  avgLatency: number | null
}

interface RecentRequest {
  id: string
  model: string
  provider: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  latencyMs: number | null
  isStreaming: boolean
  originalModel: string | null
  status: string
  feature: string | null
  createdAt: string
}

interface DailySummary {
  date: string
  totalRequests: number
  totalCost: number
  totalTokens: number
  costByProvider: Record<string, number>
  costByModel: Record<string, number>
  avgLatency: number | null
}

function formatCost(cost: number): string {
  if (cost >= 1000) return `$${(cost / 1000).toFixed(1)}k`
  if (cost >= 1) return `$${cost.toFixed(2)}`
  if (cost > 0) return `$${cost.toFixed(4)}`
  return '$0.00'
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`
  return tokens.toString()
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
  const [error, setError] = useState('')
  const [copiedKey, setCopiedKey] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Project not found')
          return
        }
        throw new Error('Failed to load project')
      }
      const data = await res.json()
      setProject(data.project)
      setStats(data.stats)
      setRecentRequests(data.recentRequests)
      setDailySummaries(data.dailySummaries)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyKey = () => {
    if (project) {
      navigator.clipboard.writeText(project.projectKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete project')
      router.push('/dashboard/projects')
    } catch {
      setError('Failed to delete project')
      setDeleting(false)
    }
  }

  // Compute cost by model/provider from daily summaries
  const costByModel = dailySummaries.reduce<Record<string, { cost: number; requests: number }>>(
    (acc, day) => {
      for (const [model, cost] of Object.entries(day.costByModel)) {
        if (!acc[model]) acc[model] = { cost: 0, requests: 0 }
        acc[model].cost += cost
      }
      return acc
    },
    {}
  )

  const costByProvider = dailySummaries.reduce<Record<string, { cost: number; requests: number }>>(
    (acc, day) => {
      for (const [provider, cost] of Object.entries(day.costByProvider)) {
        if (!acc[provider]) acc[provider] = { cost: 0, requests: 0 }
        acc[provider].cost += cost
      }
      return acc
    },
    {}
  )

  const costByModelArray = Object.entries(costByModel)
    .map(([model, data]) => ({ model, cost: data.cost, requests: data.requests }))
    .sort((a, b) => b.cost - a.cost)

  const costByProviderArray = Object.entries(costByProvider)
    .map(([provider, data]) => ({ provider, cost: data.cost, requests: data.requests }))
    .sort((a, b) => b.cost - a.cost)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !project || !stats) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--foreground-muted)] mb-4">{error || 'Project not found'}</p>
        <Link href="/dashboard/projects" className="btn-primary">
          Back to Projects
        </Link>
      </div>
    )
  }

  const maskedKey = project.projectKey.slice(0, 12) + '...' + project.projectKey.slice(-4)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/projects"
            className="p-2 hover:bg-[var(--surface-elevated)] rounded-lg transition-colors mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-[var(--foreground-muted)] mt-1">{project.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              {project.providers.map((provider) => (
                <div
                  key={provider}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--surface-elevated)]"
                >
                  <ProviderIcon provider={provider} size={14} />
                  <span className="text-xs capitalize">{provider}</span>
                </div>
              ))}
              <span className="text-xs px-2 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">
                {project.sdkPlatform === 'nodejs'
                  ? 'Node.js'
                  : project.sdkPlatform === 'python'
                    ? 'Python'
                    : 'REST'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Delete project"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Project Key */}
      <div className="bento-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1">Project Key</p>
            <code className="text-sm font-mono text-[var(--foreground-muted)]">
              {showKey ? project.projectKey : maskedKey}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 hover:bg-[var(--surface-elevated)] rounded-lg transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCopyKey}
              className="p-2 hover:bg-[var(--surface-elevated)] rounded-lg transition-colors"
              title="Copy key"
            >
              {copiedKey ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={formatTokens(stats.totalRequests)}
          icon="activity"
        />
        <StatCard
          title="Cost (30d)"
          value={formatCost(stats.totalCost30d)}
          icon="dollar"
        />
        <StatCard
          title="Tokens (30d)"
          value={formatTokens(stats.totalTokens30d)}
          icon="zap"
        />
        <StatCard
          title="Avg Latency"
          value={stats.avgLatency ? `${Math.round(stats.avgLatency)}ms` : 'N/A'}
          icon="clock"
        />
      </div>

      {/* Charts */}
      {dailySummaries.length > 0 && (
        <>
          <CostChart
            data={dailySummaries.map((d) => ({
              date: d.date,
              totalCost: d.totalCost,
              totalRequests: d.totalRequests,
            }))}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {costByModelArray.length > 0 && <CostByModel data={costByModelArray} />}
            {costByProviderArray.length > 0 && <CostByProvider data={costByProviderArray} />}
          </div>
        </>
      )}

      {/* Auto-Optimize */}
      <AutoOptimizeToggle projectId={projectId} />

      {/* Recent Requests */}
      <div className="bento-card">
        <h3 className="text-lg font-bold mb-4">Recent Requests</h3>
        {recentRequests.length === 0 ? (
          <p className="text-[var(--foreground-muted)] text-center py-8">
            No requests yet. Integrate the SDK to start tracking.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3 text-[var(--foreground-muted)] font-medium">
                    Model
                  </th>
                  <th className="text-left py-2 px-3 text-[var(--foreground-muted)] font-medium">
                    Provider
                  </th>
                  <th className="text-right py-2 px-3 text-[var(--foreground-muted)] font-medium">
                    Tokens
                  </th>
                  <th className="text-right py-2 px-3 text-[var(--foreground-muted)] font-medium">
                    Cost
                  </th>
                  <th className="text-right py-2 px-3 text-[var(--foreground-muted)] font-medium">
                    Latency
                  </th>
                  <th className="text-right py-2 px-3 text-[var(--foreground-muted)] font-medium">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentRequests.slice(0, 20).map((req) => (
                  <tr key={req.id} className="hover:bg-[var(--surface-elevated)] transition-colors">
                    <td className="py-2 px-3 font-mono text-xs">{req.model}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <ProviderIcon provider={req.provider} size={14} />
                        <span className="capitalize text-xs">{req.provider}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">{formatTokens(req.totalTokens)}</td>
                    <td className="py-2 px-3 text-right text-[var(--accent)]">
                      {formatCost(req.cost)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {req.latencyMs ? `${req.latencyMs}ms` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-[var(--foreground-muted)]">
                      {new Date(req.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Delete Project</h3>
            <p className="text-[var(--foreground-muted)] mb-6">
              Are you sure you want to delete <strong>{project.name}</strong>? This will permanently
              remove all requests, summaries, and configurations. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
