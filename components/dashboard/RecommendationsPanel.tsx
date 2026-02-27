'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Check, X, Lightbulb, TrendingDown, Zap, Layers, Scissors } from 'lucide-react'
import { useDashboardStore, Recommendation } from '@/lib/store'

const typeIcons: Record<string, typeof Sparkles> = {
  prompt_optimization: Sparkles,
  model_selection: TrendingDown,
  caching: Layers,
  batch_processing: Zap,
  context_trimming: Scissors,
}

const priorityColors: Record<string, string> = {
  high: 'text-[var(--error)] bg-[var(--error)]/10',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
  low: 'text-[var(--foreground-muted)] bg-[var(--surface-secondary)]',
}

export function RecommendationsPanel() {
  const { recommendations, loadingRecommendations, fetchRecommendations, organizationId } = useDashboardStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

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

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold">AI Recommendations</h3>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Analyzing...' : 'Generate'}
        </button>
      </div>

      {loadingRecommendations ? (
        <div className="text-center py-8 text-[var(--foreground-muted)]">Loading...</div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8 text-[var(--foreground-muted)]">
          <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No recommendations yet</p>
          <p className="text-sm">Generate AI-powered recommendations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const Icon = typeIcons[rec.type] || Sparkles
            const isExpanded = expanded === rec.id

            return (
              <div
                key={rec.id}
                className="p-4 bg-[var(--surface-secondary)] rounded-lg hover:bg-[var(--surface-secondary)]/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[rec.priority]}`}>
                          {rec.priority}
                        </span>
                        {rec.estimatedSavings && (
                          <span className="text-xs text-[var(--success)]">
                            Save {rec.estimatedSavings}%
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(rec.id)}
                    className="p-1 hover:bg-[var(--surface)] rounded transition-colors"
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
                    <p className="text-sm text-[var(--foreground-secondary)] mb-3">
                      {rec.description}
                    </p>
                    {rec.implementationEffort && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[var(--foreground-muted)]">
                          Effort: <span className="text-[var(--foreground)]">{rec.implementationEffort}</span>
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button className="btn-primary text-sm flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Implement
                      </button>
                      <button className="btn-secondary text-sm flex items-center gap-1">
                        <X className="w-4 h-4" />
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
