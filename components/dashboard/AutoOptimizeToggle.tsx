'use client'

import { useState, useEffect } from 'react'
import { Zap, Settings, AlertTriangle, Check, X } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

export function AutoOptimizeToggle({ projectId }: { projectId?: string }) {
  const { autoOptimizeConfig, loadingAutoOptimize, toggleAutoOptimize, fetchAutoOptimize } = useDashboardStore()
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [savingsTarget, setSavingsTarget] = useState(autoOptimizeConfig?.maxSavingsTarget || 0.3)
  const [qualityTolerance, setQualityTolerance] = useState(autoOptimizeConfig?.qualityTolerance || 'moderate')

  useEffect(() => {
    if (projectId) {
      fetchAutoOptimize(projectId)
    }
  }, [projectId, fetchAutoOptimize])

  const isEnabled = autoOptimizeConfig?.isEnabled ?? false

  const handleToggle = async () => {
    if (projectId) {
      await toggleAutoOptimize(projectId, !isEnabled)
    }
  }

  const handleSaveConfig = async () => {
    setIsConfiguring(false)
  }

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold">Auto-Optimization</h3>
        <button
          onClick={() => setIsConfiguring(!isConfiguring)}
          className="p-2 hover:bg-[var(--surface-secondary)] rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-[var(--foreground-muted)]" />
        </button>
      </div>

      {loadingAutoOptimize ? (
        <div className="text-center py-8 text-[var(--foreground-muted)]">Loading...</div>
      ) : (
        <>
          <div className="flex items-center justify-between p-4 bg-[var(--surface-secondary)] rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isEnabled ? 'bg-[var(--accent)]/10' : 'bg-[var(--surface)] border border-[var(--border)]'
              }`}>
                <Zap className={`w-6 h-6 ${
                  isEnabled ? 'text-[var(--accent)]' : 'text-[var(--foreground-muted)]'
                }`} />
              </div>
              <div>
                <p className="font-medium">
                  {isEnabled ? 'Active' : 'Inactive'}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {isEnabled
                    ? 'Automatically routing to cheaper models'
                    : 'Toggle to enable auto-optimization'}
                </p>
              </div>
            </div>

            {/* Toggle with icon - OFF by default (left), ON when enabled (right) */}
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${
                isEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
              }`}
              role="switch"
              aria-checked={isEnabled}
            >
              <span className="sr-only">Enable auto-optimization</span>
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transform transition-transform duration-200 ${
                  isEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                {isEnabled ? (
                  <Check className="h-4 w-4 text-[var(--accent)]" />
                ) : (
                  <X className="h-4 w-4 text-[var(--foreground-muted)]" />
                )}
              </span>
            </button>
          </div>

          {isConfiguring && (
            <div className="mt-4 p-4 bg-[var(--surface-secondary)] rounded-lg space-y-4">
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                  Max Savings Target: {Math.round(savingsTarget * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.7"
                  step="0.1"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
                <div className="flex justify-between text-xs text-[var(--foreground-muted)] mt-1">
                  <span>10%</span>
                  <span>70%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">Quality Tolerance</label>
                <select
                  value={qualityTolerance}
                  onChange={(e) => setQualityTolerance(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="strict">Strict (minimal quality loss)</option>
                  <option value="moderate">Moderate (balanced)</option>
                  <option value="aggressive">Aggressive (max savings)</option>
                </select>
              </div>

              <div className="flex items-start gap-2 p-3 bg-[var(--accent)]/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--foreground-secondary)]">
                  Auto-optimization will route simple requests to cheaper models while maintaining quality.
                  Critical requests can be excluded in settings.
                </p>
              </div>

              <button onClick={handleSaveConfig} className="btn-primary w-full">
                Save Configuration
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
