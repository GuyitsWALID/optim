'use client'

import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, FolderKanban, Cpu, Globe, Award, ArrowUpDown, Info } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { useDashboardStore } from '@/lib/store'
import { modelPricing, getModelPricing, publicBenchmarks } from '@/lib/model-pricing'
import { ProviderIcon } from '@/components/dashboard/ProviderIcon'

type Tab = 'projects' | 'models' | 'providers' | 'public'

const CHART_COLORS = ['#40A83E', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16']

export default function BenchmarksPage() {
  const { projects, fetchProjects, costByModel, costByProvider, fetchCosts, period } = useDashboardStore()
  const [tab, setTab] = useState<Tab>('projects')
  const [sortBy, setSortBy] = useState<string>('cost')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchProjects()
    fetchCosts()
  }, [])

  const tabs: { id: Tab; label: string; icon: typeof FolderKanban }[] = [
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'models', label: 'Models', icon: Cpu },
    { id: 'providers', label: 'Providers', icon: Globe },
    { id: 'public', label: 'Public Benchmarks', icon: Award },
  ]

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  // ─── Project comparison data ───
  const projectData = useMemo(() => {
    return projects
      .map(p => ({
        name: p.name,
        cost: p.totalCost30d,
        requests: p.totalRequests,
        costPerReq: p.totalRequests > 0 ? p.totalCost30d / p.totalRequests : 0,
        models: p.models.length,
        providers: p.providers.length,
      }))
      .sort((a, b) => {
        const key = sortBy as keyof typeof a
        const av = a[key] as number, bv = b[key] as number
        return sortDir === 'desc' ? bv - av : av - bv
      })
  }, [projects, sortBy, sortDir])

  // ─── Model comparison data ───
  const modelData = useMemo(() => {
    return costByModel.map(m => {
      const pricing = getModelPricing(m.model)
      return {
        model: pricing?.displayName || m.model,
        rawModel: m.model,
        provider: pricing?.provider || 'other',
        spend: m.cost,
        requests: m.requests,
        costPerReq: m.requests > 0 ? m.cost / m.requests : 0,
        inputPrice: pricing?.inputPrice ?? 0,
        outputPrice: pricing?.outputPrice ?? 0,
        tier: pricing?.capabilityTier || 'medium',
        contextWindow: pricing?.contextWindow ?? 0,
      }
    }).sort((a, b) => b.spend - a.spend)
  }, [costByModel])

  // ─── Provider comparison data ───
  const providerData = useMemo(() => {
    const providerMap = new Map<string, { spend: number; requests: number; models: Set<string> }>()
    costByModel.forEach(m => {
      const pricing = getModelPricing(m.model)
      const prov = pricing?.provider || 'other'
      const entry = providerMap.get(prov) || { spend: 0, requests: 0, models: new Set<string>() }
      entry.spend += m.cost
      entry.requests += m.requests
      entry.models.add(m.model)
      providerMap.set(prov, entry)
    })
    return Array.from(providerMap.entries())
      .map(([provider, data]) => ({
        provider,
        spend: data.spend,
        requests: data.requests,
        modelCount: data.models.size,
        costPerReq: data.requests > 0 ? data.spend / data.requests : 0,
      }))
      .sort((a, b) => b.spend - a.spend)
  }, [costByModel])

  // ─── Public benchmark sorted ───
  const sortedBenchmarks = useMemo(() => {
    return [...publicBenchmarks].sort((a, b) => (b.chatbotArena || 0) - (a.chatbotArena || 0))
  }, [])

  const fmtCost = (v: number) => v >= 1 ? `$${v.toFixed(2)}` : `$${v.toFixed(4)}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <p className="text-[var(--foreground-muted)]">Compare performance across projects, models, and providers</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--surface-secondary)] rounded-lg p-1 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ════════ Projects Tab ════════ */}
      {tab === 'projects' && (
        <div className="space-y-6">
          {projectData.length === 0 ? (
            <div className="bento-card text-center py-16">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-[var(--foreground-muted)]">Create projects to see cross-project comparisons</p>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <div className="bento-card">
                <h3 className="text-lg font-display font-bold mb-4">Cost by Project (30d)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" stroke="var(--foreground-muted)" fontSize={12} tickFormatter={v => `$${v}`} />
                      <YAxis type="category" dataKey="name" stroke="var(--foreground-muted)" fontSize={12} width={120} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                        formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']}
                      />
                      <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                        {projectData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="bento-card">
                <h3 className="text-lg font-display font-bold mb-4">Project Ranking</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">#</th>
                        <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Project</th>
                        {[
                          { key: 'cost', label: 'Total Cost' },
                          { key: 'requests', label: 'Requests' },
                          { key: 'costPerReq', label: 'Cost/Request' },
                          { key: 'models', label: 'Models' },
                          { key: 'providers', label: 'Providers' },
                        ].map(col => (
                          <th key={col.key} className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)] cursor-pointer hover:text-[var(--foreground)]" onClick={() => toggleSort(col.key)}>
                            <span className="inline-flex items-center gap-1">
                              {col.label}
                              {sortBy === col.key && <ArrowUpDown className="w-3 h-3" />}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {projectData.map((p, i) => (
                        <tr key={p.name} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-secondary)]">
                          <td className="py-3 px-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-[var(--surface-secondary)] text-[var(--foreground-muted)]'
                            }`}>{i + 1}</div>
                          </td>
                          <td className="py-3 px-3 font-medium">{p.name}</td>
                          <td className="py-3 px-3 text-right font-mono text-sm">{fmtCost(p.cost)}</td>
                          <td className="py-3 px-3 text-right">{p.requests.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono text-sm">{fmtCost(p.costPerReq)}</td>
                          <td className="py-3 px-3 text-right">{p.models}</td>
                          <td className="py-3 px-3 text-right">{p.providers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════ Models Tab ════════ */}
      {tab === 'models' && (
        <div className="space-y-6">
          {modelData.length === 0 ? (
            <div className="bento-card text-center py-16">
              <Cpu className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
              <h3 className="text-lg font-medium mb-2">No model usage data</h3>
              <p className="text-[var(--foreground-muted)]">Start sending requests to see model comparisons</p>
            </div>
          ) : (
            <>
              {/* Scatter: Cost vs Tier */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bento-card">
                  <h3 className="text-lg font-display font-bold mb-4">Spend by Model</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={modelData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="model" stroke="var(--foreground-muted)" fontSize={11} angle={-30} textAnchor="end" height={60} />
                        <YAxis stroke="var(--foreground-muted)" fontSize={12} tickFormatter={v => `$${v}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                          formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']}
                        />
                        <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
                          {modelData.slice(0, 10).map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bento-card">
                  <h3 className="text-lg font-display font-bold mb-4">Cost Efficiency (Input Price vs Output Price)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" dataKey="inputPrice" name="Input $/1M" stroke="var(--foreground-muted)" fontSize={12} label={{ value: 'Input $/1M', position: 'bottom', fontSize: 11, fill: 'var(--foreground-muted)' }} />
                        <YAxis type="number" dataKey="outputPrice" name="Output $/1M" stroke="var(--foreground-muted)" fontSize={12} label={{ value: 'Output $/1M', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--foreground-muted)' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                          formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name]}
                        />
                        <Scatter data={modelData} name="Models">
                          {modelData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Model table */}
              <div className="bento-card">
                <h3 className="text-lg font-display font-bold mb-4">Model Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Model</th>
                        <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Provider</th>
                        <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Your Spend</th>
                        <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Requests</th>
                        <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">$/Request</th>
                        <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Input $/1M</th>
                        <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Output $/1M</th>
                        <th className="text-center py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelData.map(m => (
                        <tr key={m.rawModel} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-secondary)]">
                          <td className="py-3 px-3 font-medium">{m.model}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <ProviderIcon provider={m.provider} size={18} />
                              <span className="text-sm capitalize">{m.provider}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-sm">{fmtCost(m.spend)}</td>
                          <td className="py-3 px-3 text-right">{m.requests.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono text-sm">{fmtCost(m.costPerReq)}</td>
                          <td className="py-3 px-3 text-right font-mono text-sm">${m.inputPrice.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right font-mono text-sm">${m.outputPrice.toFixed(2)}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              m.tier === 'high' ? 'bg-purple-500/10 text-purple-500'
                              : m.tier === 'medium' ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-gray-500/10 text-gray-500'
                            }`}>{m.tier}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════ Providers Tab ════════ */}
      {tab === 'providers' && (
        <div className="space-y-6">
          {providerData.length === 0 ? (
            <div className="bento-card text-center py-16">
              <Globe className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
              <h3 className="text-lg font-medium mb-2">No provider data</h3>
              <p className="text-[var(--foreground-muted)]">Start sending requests to compare providers</p>
            </div>
          ) : (
            <>
              {/* Provider cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {providerData.map((p, i) => (
                  <div key={p.provider} className="bento-card">
                    <div className="flex items-center gap-3 mb-4">
                      <ProviderIcon provider={p.provider} size={28} colored />
                      <h3 className="font-semibold capitalize">{p.provider}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">Total Spend</p>
                        <p className="text-lg font-bold">{fmtCost(p.spend)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">Requests</p>
                        <p className="text-lg font-bold">{p.requests.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">$/Request</p>
                        <p className="text-lg font-bold">{fmtCost(p.costPerReq)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">Models Used</p>
                        <p className="text-lg font-bold">{p.modelCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison bar chart */}
              <div className="bento-card">
                <h3 className="text-lg font-display font-bold mb-4">Provider Cost Comparison</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={providerData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="provider" stroke="var(--foreground-muted)" fontSize={12} />
                      <YAxis stroke="var(--foreground-muted)" fontSize={12} tickFormatter={v => `$${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                        formatter={(v: number) => [`$${v.toFixed(4)}`, 'Spend']}
                      />
                      <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
                        {providerData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════ Public Benchmarks Tab ════════ */}
      {tab === 'public' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
            <Info className="w-4 h-4" />
            <span>Public benchmark data (last updated: March 2026). Sources: Chatbot Arena, MMLU, HumanEval, MATH, GPQA.</span>
          </div>

          {/* Radar chart for top 6 */}
          <div className="bento-card">
            <h3 className="text-lg font-display font-bold mb-4">Top Models Radar</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { metric: 'MMLU', ...Object.fromEntries(sortedBenchmarks.slice(0, 6).map(b => [b.displayName, b.mmlu || 0])) },
                  { metric: 'HumanEval', ...Object.fromEntries(sortedBenchmarks.slice(0, 6).map(b => [b.displayName, b.humanEval || 0])) },
                  { metric: 'MATH', ...Object.fromEntries(sortedBenchmarks.slice(0, 6).map(b => [b.displayName, b.math || 0])) },
                  { metric: 'GPQA', ...Object.fromEntries(sortedBenchmarks.slice(0, 6).map(b => [b.displayName, b.gpqa || 0])) },
                ]}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="metric" stroke="var(--foreground-muted)" fontSize={12} />
                  <PolarRadiusAxis stroke="var(--border)" fontSize={10} />
                  {sortedBenchmarks.slice(0, 6).map((b, i) => (
                    <Radar key={b.model} name={b.displayName} dataKey={b.displayName} stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.1} />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              {sortedBenchmarks.slice(0, 6).map((b, i) => (
                <div key={b.model} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-xs text-[var(--foreground-muted)]">{b.displayName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full benchmark table */}
          <div className="bento-card">
            <h3 className="text-lg font-display font-bold mb-4">Public Benchmark Scores</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">#</th>
                    <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Model</th>
                    <th className="text-left py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Provider</th>
                    <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">Arena ELO</th>
                    <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">MMLU</th>
                    <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">HumanEval</th>
                    <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">MATH</th>
                    <th className="text-right py-3 px-3 text-sm font-medium text-[var(--foreground-muted)]">GPQA</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBenchmarks.map((b, i) => {
                    const pricing = getModelPricing(b.model)
                    return (
                      <tr key={b.model} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-secondary)]">
                        <td className="py-3 px-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-[var(--surface-secondary)] text-[var(--foreground-muted)]'
                          }`}>{i + 1}</div>
                        </td>
                        <td className="py-3 px-3 font-medium">{b.displayName}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <ProviderIcon provider={b.provider} size={18} />
                            <span className="text-sm capitalize">{b.provider}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-sm font-semibold">{b.chatbotArena || '—'}</td>
                        <td className="py-3 px-3 text-right">
                          {b.mmlu ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm">{b.mmlu}</span>
                              <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${b.mmlu}%` }} />
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {b.humanEval ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm">{b.humanEval}</span>
                              <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                                <div className="h-full bg-[#6366f1] rounded-full" style={{ width: `${b.humanEval}%` }} />
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {b.math ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm">{b.math}</span>
                              <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                                <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: `${b.math}%` }} />
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {b.gpqa ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm">{b.gpqa}</span>
                              <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                                <div className="h-full bg-[#ec4899] rounded-full" style={{ width: `${b.gpqa}%` }} />
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
