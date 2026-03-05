'use client'

import { useState, useMemo } from 'react'
import { Layers, Search, Grid3X3, List, Eye, X, ArrowUpDown, Sparkles, MessageSquare, Wrench, ScanEye } from 'lucide-react'
import { modelPricing, type ModelPricing } from '@/lib/model-pricing'
import { useDashboardStore } from '@/lib/store'
import { ProviderIcon } from '@/components/dashboard/ProviderIcon'

type ViewMode = 'grid' | 'list'
type SortOption = 'name' | 'inputPrice' | 'outputPrice' | 'contextWindow'

const TIER_COLORS: Record<string, string> = {
  high: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const ALL_PROVIDERS = Array.from(new Set(modelPricing.map(m => m.provider))).sort()

export default function ModelCatalogPage() {
  const { costByModel } = useDashboardStore()

  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [featureFilter, setFeatureFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set())
  const [showCompare, setShowCompare] = useState(false)

  // Usage lookup
  const usageMap = useMemo(() => {
    const map = new Map<string, { cost: number; requests: number }>()
    costByModel.forEach(m => map.set(m.model, { cost: m.cost, requests: m.requests }))
    return map
  }, [costByModel])

  // Filtered + sorted
  const models = useMemo(() => {
    let list = [...modelPricing]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(m => m.displayName.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))
    }
    if (providerFilter !== 'all') list = list.filter(m => m.provider === providerFilter)
    if (tierFilter !== 'all') list = list.filter(m => m.capabilityTier === tierFilter)
    if (featureFilter === 'vision') list = list.filter(m => m.supportsVision)
    if (featureFilter === 'functions') list = list.filter(m => m.supportsFunctionCalling)

    list.sort((a, b) => {
      let av: string | number, bv: string | number
      if (sortBy === 'name') { av = a.displayName.toLowerCase(); bv = b.displayName.toLowerCase() }
      else { av = a[sortBy]; bv = b[sortBy] }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [search, providerFilter, tierFilter, featureFilter, sortBy, sortDir])

  const toggleCompare = (name: string) => {
    setCompareIds(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else if (next.size < 3) next.add(name)
      return next
    })
  }

  const fmtPrice = (v: number) => v >= 1 ? `$${v.toFixed(2)}` : v > 0 ? `$${v.toFixed(2)}` : 'Free'
  const fmtCtx = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`

  const compareModels = modelPricing.filter(m => compareIds.has(m.name))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Model Catalog</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Browse {modelPricing.length} models across {ALL_PROVIDERS.length} providers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {compareIds.size > 0 && (
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Compare ({compareIds.size})
            </button>
          )}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button
              onClick={() => setView('grid')}
              className="p-2 transition-colors"
              style={{ background: view === 'grid' ? 'var(--accent)' : 'var(--surface)' }}
            >
              <Grid3X3 className="w-4 h-4" style={{ color: view === 'grid' ? '#fff' : undefined }} />
            </button>
            <button
              onClick={() => setView('list')}
              className="p-2 transition-colors"
              style={{ background: view === 'list' ? 'var(--accent)' : 'var(--surface)', borderLeft: '1px solid var(--border)' }}
            >
              <List className="w-4 h-4" style={{ color: view === 'list' ? '#fff' : undefined }} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 p-4 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          />
        </div>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Providers</option>
          {ALL_PROVIDERS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Tiers</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={featureFilter}
          onChange={(e) => setFeatureFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Features</option>
          <option value="vision">Vision</option>
          <option value="functions">Function Calling</option>
        </select>

        <button
          onClick={() => {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-transparent outline-none text-sm cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="inputPrice">Input Price</option>
            <option value="outputPrice">Output Price</option>
            <option value="contextWindow">Context Window</option>
          </select>
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
        {models.length} model{models.length !== 1 ? 's' : ''} found
        {compareIds.size > 0 && <span> &middot; {compareIds.size}/3 selected for comparison</span>}
      </p>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((m) => {
            const usage = usageMap.get(m.name)
            const isComparing = compareIds.has(m.name)
            return (
              <div
                key={m.name}
                className="p-4 rounded-xl transition-all relative group"
                style={{
                  background: 'var(--surface)',
                  border: isComparing ? '2px solid var(--accent)' : '1px solid var(--border)',
                }}
              >
                {/* Compare checkbox */}
                <button
                  onClick={() => toggleCompare(m.name)}
                  className="absolute top-3 right-3 w-5 h-5 rounded border flex items-center justify-center text-xs transition-colors"
                  style={{
                    borderColor: isComparing ? 'var(--accent)' : 'var(--border)',
                    background: isComparing ? 'var(--accent)' : 'transparent',
                    color: isComparing ? '#fff' : 'var(--foreground-muted)',
                  }}
                  title="Add to comparison"
                >
                  {isComparing && '✓'}
                </button>

                {/* Provider + Name */}
                <div className="flex items-center gap-2 mb-3">
                  <ProviderIcon provider={m.provider} size={24} />
                  <div>
                    <p className="font-semibold text-sm">{m.displayName}</p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{m.provider}</p>
                  </div>
                </div>

                {/* Tier Badge */}
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${TIER_COLORS[m.capabilityTier]}`}>
                  {m.capabilityTier}
                </span>

                {/* Pricing */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p style={{ color: 'var(--foreground-muted)' }}>Input</p>
                    <p className="font-medium">{fmtPrice(m.inputPrice)}/M</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--foreground-muted)' }}>Output</p>
                    <p className="font-medium">{fmtPrice(m.outputPrice)}/M</p>
                  </div>
                </div>

                {/* Context Window */}
                <div className="mt-2 text-xs">
                  <p style={{ color: 'var(--foreground-muted)' }}>Context Window</p>
                  <p className="font-medium">{fmtCtx(m.contextWindow)} tokens</p>
                </div>

                {/* Features */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {m.supportsVision && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">
                      <ScanEye className="w-3 h-3" /> Vision
                    </span>
                  )}
                  {m.supportsFunctionCalling && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                      <Wrench className="w-3 h-3" /> Functions
                    </span>
                  )}
                </div>

                {/* Usage badge */}
                {usage && (
                  <div className="mt-3 pt-3 text-xs" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                      <Sparkles className="w-3 h-3" />
                      Used: {usage.requests} req &middot; ${usage.cost.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="w-8 py-3 px-3"></th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Model</th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Provider</th>
                  <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Tier</th>
                  <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Input $/M</th>
                  <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Output $/M</th>
                  <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Context</th>
                  <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Features</th>
                  <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Your Usage</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => {
                  const usage = usageMap.get(m.name)
                  const isComparing = compareIds.has(m.name)
                  return (
                    <tr
                      key={m.name}
                      className="transition-colors hover:brightness-110"
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isComparing ? 'var(--accent-light, rgba(64,168,62,0.05))' : undefined,
                      }}
                    >
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleCompare(m.name)}
                          className="w-4 h-4 rounded border flex items-center justify-center text-[10px]"
                          style={{
                            borderColor: isComparing ? 'var(--accent)' : 'var(--border)',
                            background: isComparing ? 'var(--accent)' : 'transparent',
                            color: isComparing ? '#fff' : 'transparent',
                          }}
                        >
                          ✓
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-sm">{m.displayName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <ProviderIcon provider={m.provider} size={16} />
                          <span className="text-xs">{m.provider}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${TIER_COLORS[m.capabilityTier]}`}>
                          {m.capabilityTier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-xs">{fmtPrice(m.inputPrice)}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-xs">{fmtPrice(m.outputPrice)}</td>
                      <td className="py-3 px-4 text-right text-xs">{fmtCtx(m.contextWindow)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {m.supportsVision && <ScanEye className="w-3.5 h-3.5 text-sky-400" />}
                          {m.supportsFunctionCalling && <Wrench className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-xs">
                        {usage ? (
                          <span className="text-green-400">{usage.requests} req</span>
                        ) : (
                          <span style={{ color: 'var(--foreground-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {models.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--foreground-muted)' }}>
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No models match your filters</p>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && compareModels.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCompare(false)}>
          <div
            className="w-full max-w-3xl mx-4 rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Model Comparison</h2>
              <button onClick={() => setShowCompare(false)} className="p-1 rounded hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left py-3 px-4 font-medium text-xs" style={{ color: 'var(--foreground-muted)' }}>Property</th>
                    {compareModels.map(m => (
                      <th key={m.name} className="text-center py-3 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <ProviderIcon provider={m.provider} size={20} />
                          <span className="font-medium text-sm">{m.displayName}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Provider', key: 'provider' },
                    { label: 'Tier', key: 'capabilityTier' },
                    { label: 'Input Price', key: 'inputPrice', fmt: (v: number) => `${fmtPrice(v)}/M` },
                    { label: 'Output Price', key: 'outputPrice', fmt: (v: number) => `${fmtPrice(v)}/M` },
                    { label: 'Context Window', key: 'contextWindow', fmt: (v: number) => fmtCtx(v) },
                    { label: 'Vision', key: 'supportsVision', fmt: (v: boolean) => v ? 'Yes' : 'No' },
                    { label: 'Function Calling', key: 'supportsFunctionCalling', fmt: (v: boolean) => v ? 'Yes' : 'No' },
                  ].map((row) => (
                    <tr key={row.label} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 px-4 text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>{row.label}</td>
                      {compareModels.map(m => {
                        const val = (m as unknown as Record<string, unknown>)[row.key]
                        const display = row.fmt ? row.fmt(val as never) : String(val ?? '—')
                        return (
                          <td key={m.name} className="py-3 px-4 text-center text-xs">{display}</td>
                        )
                      })}
                    </tr>
                  ))}
                  {/* Usage row */}
                  <tr>
                    <td className="py-3 px-4 text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>Your Usage</td>
                    {compareModels.map(m => {
                      const usage = usageMap.get(m.name)
                      return (
                        <td key={m.name} className="py-3 px-4 text-center text-xs">
                          {usage ? `${usage.requests} req / $${usage.cost.toFixed(4)}` : '—'}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
