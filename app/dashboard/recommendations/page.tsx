'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Check, X, Lightbulb, TrendingDown, Zap, Layers, Scissors, RefreshCw, Filter, Trash2, History, DollarSign, FolderKanban } from 'lucide-react'
import { useDashboardStore, Recommendation } from '@/lib/store'

const typeIcons: Record<string, typeof Sparkles> = {
  prompt_optimization: Sparkles,
  model_selection: TrendingDown,
  caching: Layers,
  batch_processing: Zap,
  context_trimming: Scissors,
}

const typeLabels: Record<string, string> = {
  prompt_optimization: 'Prompt Optimization',
  model_selection: 'Model Selection',
  caching: 'Caching',
  batch_processing: 'Batch Processing',
  context_trimming: 'Context Trimming',
}

const priorityColors: Record<string, string> = {
  high: 'text-[var(--error)] bg-[var(--error)]/10 border-[var(--error)]/20',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20',
  low: 'text-[var(--foreground-muted)] bg-[var(--surface-secondary)] border-[var(--border)]',
}

export default function RecommendationsPage() {
  const { recommendations, loadingRecommendations, fetchRecommendations, projects, fetchProjects } = useDashboardStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active')

  // Local state for implement/dismiss (optimistic UI)
  const [implementedIds, setImplementedIds] = useState<Set<string>>(new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProjects()
    fetchRecommendations()
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const body: Record<string, string> = {}
      if (projectFilter !== 'all') {
        body.projectId = projectFilter
      }
      await fetch('/api/v1/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      await fetchRecommendations()
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleImplement = (id: string) => {
    setImplementedIds(prev => new Set(prev).add(id))
    setExpanded(null)
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id))
    setExpanded(null)
  }

  const handleUndoImplement = (id: string) => {
    setImplementedIds(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const handleUndoDismiss = (id: string) => {
    setDismissedIds(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  const activeRecommendations = recommendations.filter(r =>
    !implementedIds.has(r.id) && !dismissedIds.has(r.id)
  )
  const historyRecommendations = recommendations.filter(r =>
    implementedIds.has(r.id) || dismissedIds.has(r.id)
  )
  const displayList = viewMode === 'active' ? activeRecommendations : historyRecommendations

  const filteredRecommendations = displayList.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (projectFilter !== 'all' && r.project?.name !== projects.find(p => p.id === projectFilter)?.name) return false
    return true
  })

  const stats = {
    total: activeRecommendations.length,
    high: activeRecommendations.filter(r => r.priority === 'high').length,
    medium: activeRecommendations.filter(r => r.priority === 'medium').length,
    low: activeRecommendations.filter(r => r.priority === 'low').length,
    potentialSavings: activeRecommendations.reduce((acc, r) => acc + (r.estimatedSavings || 0), 0),
    implemented: implementedIds.size,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-[var(--foreground-muted)]">AI-powered recommendations to optimize your costs</p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Analyzing...' : 'Generate Recommendations'}
        </button>
      </div>

      {/* Savings Banner */}
      {stats.potentialSavings > 0 && (
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-sm text-[var(--foreground-muted)]">Estimated Total Savings</p>
            <p className="text-2xl font-bold text-[var(--accent)]">{stats.potentialSavings}%</p>
            <p className="text-xs text-[var(--foreground-muted)]">
              across {stats.total} active recommendation{stats.total !== 1 ? 's' : ''} ({stats.high} high priority)
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bento-card">
          <p className="text-sm text-[var(--foreground-muted)]">Active</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm text-[var(--foreground-muted)]">High Priority</p>
          <p className="text-2xl font-bold text-[var(--error)]">{stats.high}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm text-[var(--foreground-muted)]">Medium</p>
          <p className="text-2xl font-bold text-[var(--warning)]">{stats.medium}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm text-[var(--foreground-muted)]">Low</p>
          <p className="text-2xl font-bold text-[var(--foreground-muted)]">{stats.low}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm text-[var(--foreground-muted)]">Implemented</p>
          <p className="text-2xl font-bold text-[var(--success,#22c55e)]">{stats.implemented}</p>
        </div>
      </div>

      {/* View Toggle + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex bg-[var(--surface-secondary)] rounded-lg p-1">
          <button
            onClick={() => setViewMode('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'active'
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Active ({activeRecommendations.length})
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'history'
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <History className="w-4 h-4" />
            History ({historyRecommendations.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-[var(--foreground-muted)]" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-[var(--foreground-muted)]" />
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'model_selection', label: 'Model Selection' },
            { value: 'prompt_optimization', label: 'Prompt' },
            { value: 'caching', label: 'Caching' },
            { value: 'batch_processing', label: 'Batch' },
            { value: 'context_trimming', label: 'Context' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === f.value
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      {loadingRecommendations ? (
        <div className="bento-card text-center py-16">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 text-[var(--foreground-muted)] animate-spin" />
          <p>Loading recommendations...</p>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="bento-card text-center py-16">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            {viewMode === 'history' ? 'No history yet' : 'No recommendations yet'}
          </h3>
          <p className="text-[var(--foreground-muted)] mb-4">
            {viewMode === 'history'
              ? 'Implemented and dismissed recommendations will appear here'
              : typeFilter !== 'all' ? 'No recommendations match this filter' : 'Generate AI-powered recommendations to optimize your costs'
            }
          </p>
          {viewMode === 'active' && typeFilter === 'all' && (
            <button onClick={handleGenerate} disabled={generating} className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Recommendations
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => {
            const Icon = typeIcons[rec.type] || Sparkles
            const isExpanded = expanded === rec.id
            const isImplemented = implementedIds.has(rec.id)
            const isDismissed = dismissedIds.has(rec.id)

            return (
              <div
                key={rec.id}
                className={`bento-card transition-colors ${
                  isImplemented ? 'border-[var(--success,#22c55e)]/30 bg-[var(--success,#22c55e)]/5'
                  : isDismissed ? 'opacity-60'
                  : 'hover:border-[var(--accent)]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isImplemented ? 'bg-[var(--success,#22c55e)]/10' : 'bg-[var(--accent)]/10'
                    }`}>
                      {isImplemented ? <Check className="w-6 h-6 text-[var(--success,#22c55e)]" />
                       : isDismissed ? <X className="w-6 h-6 text-[var(--foreground-muted)]" />
                       : <Icon className="w-6 h-6 text-[var(--accent)]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[rec.priority]}`}>
                          {rec.priority}
                        </span>
                        <span className="text-xs text-[var(--foreground-muted)]">
                          {typeLabels[rec.type] || rec.type}
                        </span>
                        {rec.estimatedSavings != null && rec.estimatedSavings > 0 && (
                          <span className="text-xs font-medium text-[var(--accent)]">Save {rec.estimatedSavings}%</span>
                        )}
                        {rec.project?.name && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--foreground-muted)]">
                            {rec.project.name}
                          </span>
                        )}
                        {isImplemented && <span className="text-xs font-medium text-[var(--success,#22c55e)]">Implemented</span>}
                        {isDismissed && <span className="text-xs font-medium text-[var(--foreground-muted)]">Dismissed</span>}
                      </div>
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                      <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">{rec.description}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleExpand(rec.id)} className="p-2 hover:bg-[var(--surface-secondary)] rounded-lg transition-colors">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--foreground-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--foreground-muted)]" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-[var(--foreground-secondary)] mb-4">{rec.description}</p>
                    <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)] mb-4">
                      {rec.implementationEffort && (
                        <span>Effort: <span className="text-[var(--foreground)] capitalize">{rec.implementationEffort}</span></span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {viewMode === 'active' ? (
                        <>
                          <button onClick={() => handleImplement(rec.id)} className="btn-primary flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4" /> Mark as Implemented
                          </button>
                          <button onClick={() => handleDismiss(rec.id)} className="btn-secondary flex items-center gap-2 text-sm">
                            <Trash2 className="w-4 h-4" /> Dismiss
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => isImplemented ? handleUndoImplement(rec.id) : handleUndoDismiss(rec.id)}
                          className="btn-secondary flex items-center gap-2 text-sm"
                        >
                          <RefreshCw className="w-4 h-4" /> Undo
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
