'use client'

import { useState, useMemo } from 'react'
import {
  Wallet, Plus, Trash2, AlertTriangle, Bell, BellOff, TrendingUp,
  DollarSign, Calendar, Info, X,
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

interface Budget {
  id: string
  name: string
  projectId: string | null // null = all projects
  amount: number
  period: 'daily' | 'weekly' | 'monthly'
  alertThreshold: number // 0.0 - 1.0, e.g. 0.8 = alert at 80%
  alertEnabled: boolean
  createdAt: string
}

interface AlertItem {
  id: string
  budgetId: string
  budgetName: string
  message: string
  type: 'warning' | 'critical'
  createdAt: string
  read: boolean
}

export default function BudgetsAlertsPage() {
  const { projects, costSummary } = useDashboardStore()

  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      name: 'Monthly Total',
      projectId: null,
      amount: 100,
      period: 'monthly',
      alertThreshold: 0.8,
      alertEnabled: true,
      createdAt: new Date().toISOString(),
    },
  ])

  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formProject, setFormProject] = useState<string>('all')
  const [formAmount, setFormAmount] = useState('')
  const [formPeriod, setFormPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [formThreshold, setFormThreshold] = useState('80')

  const resetForm = () => {
    setFormName('')
    setFormProject('all')
    setFormAmount('')
    setFormPeriod('monthly')
    setFormThreshold('80')
    setShowCreateForm(false)
  }

  const handleCreate = () => {
    if (!formName.trim() || !formAmount) return
    const budget: Budget = {
      id: Date.now().toString(),
      name: formName.trim(),
      projectId: formProject === 'all' ? null : formProject,
      amount: parseFloat(formAmount),
      period: formPeriod,
      alertThreshold: parseInt(formThreshold) / 100,
      alertEnabled: true,
      createdAt: new Date().toISOString(),
    }
    setBudgets(prev => [...prev, budget])
    resetForm()
  }

  const handleDelete = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  const toggleAlert = (id: string) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, alertEnabled: !b.alertEnabled } : b))
  }

  // Simulate spending as % of budget using real totalCost
  const getSpend = (budget: Budget) => {
    // Use total cost from store as a rough proxy
    const base = costSummary.totalCost
    if (budget.period === 'daily') return base / 30
    if (budget.period === 'weekly') return base / 4
    return base
  }

  const fmtCost = (v: number) => v >= 1 ? `$${v.toFixed(2)}` : v > 0 ? `$${v.toFixed(4)}` : '$0.00'

  const unreadAlerts = alerts.filter(a => !a.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets & Alerts</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Set spending limits and get notified before costs exceed your budgets
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus className="w-4 h-4" /> New Budget
        </button>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl text-sm"
        style={{ background: 'var(--accent)', color: '#fff', opacity: 0.9 }}
      >
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Budget tracking is in preview</p>
          <p className="mt-0.5 opacity-80">
            Budgets are stored locally for now. Backend persistence and email/webhook alerts are coming soon.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--foreground-muted)' }}>
            <Wallet className="w-4 h-4" />
            <span className="text-xs">Active Budgets</span>
          </div>
          <p className="text-2xl font-bold">{budgets.length}</p>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--foreground-muted)' }}>
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Total Budget</span>
          </div>
          <p className="text-2xl font-bold">{fmtCost(budgets.reduce((s, b) => s + b.amount, 0))}</p>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--foreground-muted)' }}>
            <Bell className="w-4 h-4" />
            <span className="text-xs">Active Alerts</span>
          </div>
          <p className="text-2xl font-bold">{unreadAlerts}</p>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>YOUR BUDGETS</h2>

        {budgets.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
          >
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No budgets configured</p>
            <p className="text-sm mt-1">Create a budget to start tracking your spending limits</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((budget) => {
              const spent = getSpend(budget)
              const percentage = Math.min((spent / budget.amount) * 100, 100)
              const isWarning = percentage >= budget.alertThreshold * 100
              const isCritical = percentage >= 95
              const projectName = budget.projectId
                ? projects.find(p => p.id === budget.projectId)?.name || 'Unknown'
                : 'All Projects'

              return (
                <div
                  key={budget.id}
                  className="p-5 rounded-xl"
                  style={{
                    background: 'var(--surface)',
                    border: isCritical ? '1px solid rgba(239,68,68,0.4)' : isWarning ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{budget.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                        {projectName} &middot; {budget.period}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleAlert(budget.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                        title={budget.alertEnabled ? 'Disable alerts' : 'Enable alerts'}
                      >
                        {budget.alertEnabled ? (
                          <Bell className="w-4 h-4 text-amber-400" />
                        ) : (
                          <BellOff className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-lg font-bold">{fmtCost(spent)}</span>
                      <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        of {fmtCost(budget.amount)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          background: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--accent)',
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>
                        {percentage.toFixed(1)}% used
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>
                        Alert at {(budget.alertThreshold * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Warning message */}
                  {isWarning && budget.alertEnabled && (
                    <div className={`mt-3 flex items-center gap-2 text-xs p-2 rounded-lg ${isCritical ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {isCritical
                        ? 'Budget nearly exhausted! Consider increasing the limit.'
                        : `Spending has reached ${percentage.toFixed(0)}% of this budget.`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>ALERT HISTORY</h2>
        <div
          className="text-center py-12 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
        >
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No alerts yet</p>
          <p className="text-xs mt-1">Alerts will appear here when spending approaches budget limits</p>
        </div>
      </div>

      {/* Create Budget Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={resetForm}>
          <div
            className="w-full max-w-md mx-4 rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Create Budget</h2>
              <button onClick={resetForm} className="p-1 rounded hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--foreground-muted)' }}>Budget Name</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly API Spend"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                />
              </div>

              {/* Project */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--foreground-muted)' }}>Project</label>
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <option value="all">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Amount + Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--foreground-muted)' }}>Amount ($)</label>
                  <input
                    type="number"
                    placeholder="100"
                    min="1"
                    step="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--foreground-muted)' }}>Period</label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Alert Threshold */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--foreground-muted)' }}>
                  Alert at {formThreshold}% of budget
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={formThreshold}
                  onChange={(e) => setFormThreshold(e.target.value)}
                  className="w-full accent-[var(--accent)]"
                />
                <div className="flex justify-between text-[10px]" style={{ color: 'var(--foreground-muted)' }}>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!formName.trim() || !formAmount}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Create Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
