'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar, FolderKanban, TrendingUp, DollarSign, Zap, Activity } from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useDashboardStore } from '@/lib/store'

const COLORS = ['#40A83E', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16']

export default function AnalyticsPage() {
  const {
    projects, fetchProjects,
    costSummary, dailyData, costByModel, costByProvider,
    fetchCosts, period, setPeriod, selectedProjectId, setSelectedProjectId,
    loadingCosts,
  } = useDashboardStore()

  const [localProject, setLocalProject] = useState<string>('all')

  useEffect(() => {
    fetchProjects()
    fetchCosts()
  }, [])

  const handleProjectChange = (id: string) => {
    setLocalProject(id)
    setSelectedProjectId(id === 'all' ? null : id)
  }

  const handlePeriodChange = (p: 'day' | 'week' | 'month' | 'year') => {
    setPeriod(p)
  }

  // Derived: tokens per request over time
  const tokenEfficiency = useMemo(() => {
    return dailyData.map(d => ({
      date: d.date,
      avgTokens: d.totalRequests > 0 ? Math.round((d.totalTokens || 0) / d.totalRequests) : 0,
    }))
  }, [dailyData])

  // Format helpers
  const fmtDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  const fmtCost = (v: number) => v >= 1 ? `$${v.toFixed(2)}` : v > 0 ? `$${v.toFixed(4)}` : '$0.00'

  // Top models table
  const topModels = useMemo(() => {
    return [...costByModel].sort((a, b) => b.cost - a.cost).slice(0, 10)
  }, [costByModel])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-[var(--foreground-muted)]">Deep-dive into your usage trends and cost breakdowns</p>
        <div className="flex items-center gap-3">
          {/* Project selector */}
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[var(--foreground-muted)]" />
            <select
              value={localProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="input-field text-sm py-2"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {/* Period selector */}
          <div className="flex bg-[var(--surface-secondary)] rounded-lg p-1">
            {(['day', 'week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  period === p
                    ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">Total Spend</span>
            <DollarSign className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <p className="text-2xl font-bold">{fmtCost(costSummary.totalCost)}</p>
        </div>
        <div className="bento-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">Requests</span>
            <Activity className="w-4 h-4 text-[#6366f1]" />
          </div>
          <p className="text-2xl font-bold">{costSummary.totalRequests.toLocaleString()}</p>
        </div>
        <div className="bento-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">Total Tokens</span>
            <Zap className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <p className="text-2xl font-bold">{costSummary.totalTokens.toLocaleString()}</p>
        </div>
        <div className="bento-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">Avg Cost/Request</span>
            <TrendingUp className="w-4 h-4 text-[var(--foreground-muted)]" />
          </div>
          <p className="text-2xl font-bold">
            {costSummary.totalRequests > 0 ? fmtCost(costSummary.totalCost / costSummary.totalRequests) : '$0.00'}
          </p>
        </div>
      </div>

      {/* Cost Trend + Request Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card">
          <h3 className="text-lg font-display font-bold mb-4">Cost Trend</h3>
          <div className="h-64">
            {dailyData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--foreground-muted)]">No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#40A83E" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#40A83E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--foreground-muted)" fontSize={11} tickFormatter={fmtDate} />
                  <YAxis stroke="var(--foreground-muted)" fontSize={11} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelFormatter={fmtDate}
                    formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']}
                  />
                  <Area type="monotone" dataKey="totalCost" stroke="#40A83E" fill="url(#costGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bento-card">
          <h3 className="text-lg font-display font-bold mb-4">Request Volume</h3>
          <div className="h-64">
            {dailyData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--foreground-muted)]">No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--foreground-muted)" fontSize={11} tickFormatter={fmtDate} />
                  <YAxis stroke="var(--foreground-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelFormatter={fmtDate}
                    formatter={(v: number) => [v.toLocaleString(), 'Requests']}
                  />
                  <Area type="monotone" dataKey="totalRequests" stroke="#6366f1" fill="url(#reqGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Token Efficiency + Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card">
          <h3 className="text-lg font-display font-bold mb-4">Token Efficiency (Avg Tokens/Request)</h3>
          <div className="h-64">
            {tokenEfficiency.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--foreground-muted)]">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tokenEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--foreground-muted)" fontSize={11} tickFormatter={fmtDate} />
                  <YAxis stroke="var(--foreground-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelFormatter={fmtDate}
                    formatter={(v: number) => [v.toLocaleString(), 'Avg Tokens']}
                  />
                  <Line type="monotone" dataKey="avgTokens" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bento-card">
          <h3 className="text-lg font-display font-bold mb-4">Cost by Provider</h3>
          <div className="h-64">
            {costByProvider.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--foreground-muted)]">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costByProvider}
                    dataKey="cost"
                    nameKey="provider"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={2}
                    label={({ provider, percent }) => `${provider} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {costByProvider.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Models Table */}
      <div className="bento-card">
        <h3 className="text-lg font-display font-bold mb-4">Top Models by Spend</h3>
        {topModels.length === 0 ? (
          <div className="text-center py-8 text-[var(--foreground-muted)]">No model data yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">#</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Model</th>
                  <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Spend</th>
                  <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Requests</th>
                  <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">$/Request</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Share</th>
                </tr>
              </thead>
              <tbody>
                {topModels.map((m, i) => {
                  const share = costSummary.totalCost > 0 ? (m.cost / costSummary.totalCost) * 100 : 0
                  return (
                    <tr key={m.model} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-secondary)]">
                      <td className="py-3 px-3 text-[var(--foreground-muted)]">{i + 1}</td>
                      <td className="py-3 px-3 font-medium">{m.model}</td>
                      <td className="py-3 px-3 text-right font-mono text-sm">{fmtCost(m.cost)}</td>
                      <td className="py-3 px-3 text-right">{m.requests.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-sm">{m.requests > 0 ? fmtCost(m.cost / m.requests) : '—'}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                          <span className="text-xs text-[var(--foreground-muted)]">{share.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
