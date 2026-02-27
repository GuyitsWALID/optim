'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Check, X, Lightbulb, TrendingDown, Zap, Layers, Scissors, RefreshCw, Filter, Trash2 } from 'lucide-react'
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
  const { recommendations, loadingRecommendations, fetchRecommendations, organizationId } = useDashboardStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await fetch('/api/v1/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      })
      await fetchRecommendations()
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setGenerating(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  const filteredRecommendations = filter === 'all'
    ? recommendations
    : recommendations.filter(r => r.type === filter)

  const stats = {
    total: recommendations.length,
    high: recommendations.filter(r => r.priority === 'high').length,
    medium: recommendations.filter(r => r.priority === 'medium').length,
    low: recommendations.filter(r => r.priority === 'low').length,
    potentialSavings: recommendations.reduce((acc, r) => acc + (r.estimatedSavings || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--foreground-muted)]">AI-powered recommendations to optimize your costs</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Analyzing...' : 'Generate Recommendations'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bento-card">
          <p className="text-sm text-[var(--foreground-muted)]">Total</p>
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
          <p className="text-sm text-[var(--foreground-muted)]">Potential Savings</p>
          <p className="text-2xl font-bold text-[var(--accent)]">{stats.potentialSavings}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-[var(--foreground-muted)]" />
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'model_selection', label: 'Model Selection' },
            { value: 'prompt_optimization', label: 'Prompt Optimization' },
            { value: 'caching', label: 'Caching' },
            { value: 'batch_processing', label: 'Batch Processing' },
            { value: 'context_trimming', label: 'Context Trimming' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.value
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
          <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
          <p className="text-[var(--foreground-muted)] mb-4">
            {filter !== 'all' ? 'No recommendations match this filter' : 'Generate AI-powered recommendations to optimize your costs'}
          </p>
          {filter === 'all' && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary inline-flex items-center gap-2"
            >
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

            return (
              <div
                key={rec.id}
                className="bento-card hover:border-[var(--accent)]/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[var(--accent)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[rec.priority]}`}>
                          {rec.priority}
                        </span>
                        <span className="text-xs text-[var(--foreground-muted)]">
                          {typeLabels[rec.type] || rec.type}
                        </span>
                        {rec.estimatedSavings && (
                          <span className="text-xs font-medium text-[var(--accent)]">
                            Save {rec.estimatedSavings}%
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                      <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(rec.id)}
                    className="p-2 hover:bg-[var(--surface-secondary)] rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[var(--foreground-muted)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--foreground-muted)]" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-[var(--foreground-secondary)] mb-4">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)] mb-4">
                      {rec.implementationEffort && (
                        <span>
                          Effort: <span className="text-[var(--foreground)] capitalize">{rec.implementationEffort}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button className="btn-primary flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4" />
                        Mark as Implemented
                      </button>
                      <button className="btn-secondary flex items-center gap-2 text-sm">
                        <Trash2 className="w-4 h-4" />
                        Dismiss
                      </button>
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
