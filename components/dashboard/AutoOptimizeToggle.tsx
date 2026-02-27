'use client'

import { useState } from 'react'
import { Zap, Settings, Check, AlertTriangle } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

export function AutoOptimizeToggle() {
  const { autoOptimizeConfig, loadingAutoOptimize, toggleAutoOptimize, fetchAutoOptimize } = useDashboardStore()
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [savingsTarget, setSavingsTarget] = useState(autoOptimizeConfig?.maxSavingsTarget || 0.3)
  const [qualityTolerance, setQualityTolerance] = useState(autoOptimizeConfig?.qualityTolerance || 'moderate')

  const handleToggle = async () => {
    await toggleAutoOptimize(!autoOptimizeConfig?.isEnabled)
  }

  const handleSaveConfig = async () => {
    // Save configuration
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
                autoOptimizeConfig?.isEnabled ? 'bg-[var(--success)]/10' : 'bg-[var(--surface)]'
              }`}>
                <Zap className={`w-6 h-6 ${
                  autoOptimizeConfig?.isEnabled ? 'text-[var(--success)]' : 'text-[var(--foreground-muted)]'
                }`} />
              </div>
              <div>
                <p className="font-medium">
                  {autoOptimizeConfig?.isEnabled ? 'Active' : 'Inactive'}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {autoOptimizeConfig?.isEnabled
                    ? 'Automatically routing to cheaper models'
                    : 'Toggle to enable auto-optimization'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                autoOptimizeConfig?.isEnabled ? 'bg-[var(--success)]' : 'bg-[var(--surface)]'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  autoOptimizeConfig?.isEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
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
                  className="w-full"
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
