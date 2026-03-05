'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ScrollText, Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Download, Clock, Zap, AlertTriangle, CheckCircle2, XCircle, Loader2,
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import type { RequestLog } from '@/lib/store'
import { ProviderIcon } from '@/components/dashboard/ProviderIcon'

const PAGE_SIZE = 25

export default function UsageLogsPage() {
  const {
    projects, fetchProjects,
    requestLogs, requestLogsTotal, loadingRequestLogs,
    fetchRequestLogs,
  } = useDashboardStore()

  // Filters
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [modelFilter, setModelFilter] = useState('')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination
  const [page, setPage] = useState(0)

  // Expanded rows
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Sort
  const [sortField, setSortField] = useState<'createdAt' | 'cost' | 'latencyMs' | 'totalTokens'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    fetchRequestLogs({
      projectId: projectFilter === 'all' ? undefined : projectFilter,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
  }, [projectFilter, page])

  // Derived unique providers from current logs
  const uniqueProviders = useMemo(() => {
    const set = new Set(requestLogs.map(r => r.provider))
    return Array.from(set).sort()
  }, [requestLogs])

  // Client-side filtering & sorting (on current page data)
  const filteredLogs = useMemo(() => {
    let logs = [...requestLogs]

    if (providerFilter !== 'all') {
      logs = logs.filter(r => r.provider === providerFilter)
    }
    if (statusFilter !== 'all') {
      logs = logs.filter(r => (r.status || 'success') === statusFilter)
    }
    if (modelFilter) {
      logs = logs.filter(r => r.model.toLowerCase().includes(modelFilter.toLowerCase()))
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      logs = logs.filter(r =>
        r.model.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.project.name.toLowerCase().includes(q) ||
        (r.feature || '').toLowerCase().includes(q) ||
        (r.tags || '').toLowerCase().includes(q)
      )
    }

    // Sort
    logs.sort((a, b) => {
      const av = sortField === 'createdAt' ? new Date(a.createdAt).getTime() : (a[sortField] ?? 0)
      const bv = sortField === 'createdAt' ? new Date(b.createdAt).getTime() : (b[sortField] ?? 0)
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })

    return logs
  }, [requestLogs, providerFilter, statusFilter, modelFilter, searchQuery, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(requestLogsTotal / PAGE_SIZE))

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  const fmtCost = (v: number) => v >= 1 ? `$${v.toFixed(2)}` : v > 0 ? `$${v.toFixed(4)}` : '$0.00'
  const fmtDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  const fmtLatency = (ms: number | null) => ms == null ? '—' : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`

  const handleExportCSV = useCallback(() => {
    const headers = ['Timestamp', 'Project', 'Model', 'Provider', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens', 'Cost', 'Latency (ms)', 'Status', 'Streaming', 'Feature', 'Tags']
    const rows = filteredLogs.map(r => [
      r.createdAt,
      r.project.name,
      r.model,
      r.provider,
      r.promptTokens,
      r.completionTokens,
      r.totalTokens,
      r.cost,
      r.latencyMs ?? '',
      r.status || 'success',
      r.isStreaming ? 'Yes' : 'No',
      r.feature || '',
      r.tags || '',
    ])
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `optim-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredLogs])

  const StatusBadge = ({ status }: { status: string | null }) => {
    const s = status || 'success'
    if (s === 'success') return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 className="w-3 h-3" /> OK
      </span>
    )
    if (s === 'error') return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
        <XCircle className="w-3 h-3" /> Error
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
        <AlertTriangle className="w-3 h-3" /> {s}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usage Logs</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Detailed view of all API requests across your projects
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 p-4 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
          <input
            type="text"
            placeholder="Search model, provider, project, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          />
        </div>

        {/* Project */}
        <select
          value={projectFilter}
          onChange={(e) => { setProjectFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Provider */}
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Providers</option>
          {uniqueProviders.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>

        {/* Model search */}
        <input
          type="text"
          placeholder="Filter model..."
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none w-[140px]"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: requestLogsTotal.toLocaleString(), icon: ScrollText },
          { label: 'Page Results', value: filteredLogs.length.toLocaleString(), icon: Filter },
          {
            label: 'Avg Latency',
            value: fmtLatency(
              filteredLogs.length > 0
                ? Math.round(filteredLogs.reduce((s, r) => s + (r.latencyMs || 0), 0) / filteredLogs.filter(r => r.latencyMs).length) || 0
                : null
            ),
            icon: Clock,
          },
          {
            label: 'Page Cost',
            value: fmtCost(filteredLogs.reduce((s, r) => s + r.cost, 0)),
            icon: Zap,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--foreground-muted)' }}>
              <stat.icon className="w-4 h-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <p className="text-lg font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {loadingRequestLogs ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--foreground-muted)' }} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--foreground-muted)' }}>
            <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No requests found</p>
            <p className="text-sm mt-1">Integrate the SDK to start logging requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                    <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1">
                      Time <SortIcon field="createdAt" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Project</th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Model</th>
                  <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Provider</th>
                  <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                    <button onClick={() => handleSort('totalTokens')} className="flex items-center gap-1 ml-auto">
                      Tokens <SortIcon field="totalTokens" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                    <button onClick={() => handleSort('cost')} className="flex items-center gap-1 ml-auto">
                      Cost <SortIcon field="cost" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                    <button onClick={() => handleSort('latencyMs')} className="flex items-center gap-1 ml-auto">
                      Latency <SortIcon field="latencyMs" />
                    </button>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Status</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    expanded={expandedId === log.id}
                    onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    fmtCost={fmtCost}
                    fmtDate={fmtDate}
                    fmtLatency={fmtLatency}
                    StatusBadge={StatusBadge}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {requestLogsTotal > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, requestLogsTotal)} of {requestLogsTotal.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg transition-colors disabled:opacity-30"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm px-3">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg transition-colors disabled:opacity-30"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- Expandable Row Component ---- */
function LogRow({
  log, expanded, onToggle, fmtCost, fmtDate, fmtLatency, StatusBadge,
}: {
  log: RequestLog
  expanded: boolean
  onToggle: () => void
  fmtCost: (v: number) => string
  fmtDate: (d: string) => string
  fmtLatency: (ms: number | null) => string
  StatusBadge: React.FC<{ status: string | null }>
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer transition-colors hover:brightness-110"
        style={{ borderBottom: '1px solid var(--border)', background: expanded ? 'var(--bg)' : undefined }}
      >
        <td className="py-3 px-4 whitespace-nowrap text-xs" style={{ color: 'var(--foreground-muted)' }}>
          {fmtDate(log.createdAt)}
        </td>
        <td className="py-3 px-4 whitespace-nowrap text-xs">{log.project.name}</td>
        <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">{log.model}</td>
        <td className="py-3 px-4 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <ProviderIcon provider={log.provider} size={16} colored shape="circle" />
            <span className="text-xs">{log.provider}</span>
          </div>
        </td>
        <td className="py-3 px-4 text-right whitespace-nowrap text-xs tabular-nums">
          {log.totalTokens.toLocaleString()}
        </td>
        <td className="py-3 px-4 text-right whitespace-nowrap text-xs font-medium tabular-nums">
          {fmtCost(log.cost)}
        </td>
        <td className="py-3 px-4 text-right whitespace-nowrap text-xs tabular-nums">
          {fmtLatency(log.latencyMs)}
        </td>
        <td className="py-3 px-4 text-center">
          <StatusBadge status={log.status} />
        </td>
        <td className="py-3 px-2">
          {expanded ? <ChevronUp className="w-3.5 h-3.5 opacity-50" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: 'var(--bg)' }}>
          <td colSpan={9} className="px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <Detail label="Prompt Tokens" value={log.promptTokens.toLocaleString()} />
              <Detail label="Completion Tokens" value={log.completionTokens.toLocaleString()} />
              <Detail label="Streaming" value={log.isStreaming ? 'Yes' : 'No'} />
              <Detail label="Original Model" value={log.originalModel || '—'} />
              <Detail label="Feature" value={log.feature || '—'} />
              <Detail label="Tags" value={log.tags || '—'} />
              <Detail label="Runtime" value={log.runtime || '—'} />
              <Detail label="Error Type" value={log.errorType || '—'} />
              <Detail label="Request ID" value={log.id} mono />
              <Detail label="Project ID" value={log.projectId} mono />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="mb-0.5" style={{ color: 'var(--foreground-muted)' }}>{label}</p>
      <p className={`font-medium ${mono ? 'font-mono text-[11px] break-all' : ''}`}>{value}</p>
    </div>
  )
}
