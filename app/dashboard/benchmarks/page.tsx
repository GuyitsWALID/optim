'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, Award, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

// Mock benchmark data
const benchmarkData = [
  { month: 'Jan', industry: 1250, topPerformer: 890, yourAvg: 1100 },
  { month: 'Feb', industry: 1380, topPerformer: 920, yourAvg: 1150 },
  { month: 'Mar', industry: 1420, topPerformer: 950, yourAvg: 1080 },
  { month: 'Apr', industry: 1560, topPerformer: 1020, yourAvg: 1200 },
  { month: 'May', industry: 1680, topPerformer: 1080, yourAvg: 1320 },
  { month: 'Jun', industry: 1720, topPerformer: 1150, yourAvg: 1280 },
]

const modelPerformance = [
  { model: 'GPT-4o', costPer1k: 0.075, latency: 1200, quality: 95, efficiency: 78 },
  { model: 'Claude 3.5', costPer1k: 0.09, latency: 1400, quality: 94, efficiency: 72 },
  { model: 'GPT-4o Mini', costPer1k: 0.002, latency: 800, quality: 88, efficiency: 95 },
  { model: 'Claude Haiku', costPer1k: 0.012, latency: 700, quality: 85, efficiency: 92 },
  { model: 'Gemini Flash', costPer1k: 0.002, latency: 650, quality: 86, efficiency: 94 },
]

const leaderboard = [
  { rank: 1, company: 'TechCorp', costReduction: 67, requests: '2.4M', trend: 'up' },
  { rank: 2, company: 'AI Startup', costReduction: 58, requests: '1.8M', trend: 'up' },
  { rank: 3, company: 'DataCo', costReduction: 52, requests: '1.2M', trend: 'up' },
  { rank: 4, company: 'Cloudify', costReduction: 48, requests: '980K', trend: 'down' },
  { rank: 5, company: 'Your Organization', costReduction: 42, requests: '750K', trend: 'up' },
]

export default function BenchmarksPage() {
  const [timeframe, setTimeframe] = useState('6m')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--foreground-muted)]">Compare your performance with industry benchmarks</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="input-field"
        >
          <option value="1m">Last Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bento-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">Cost vs Industry</span>
            <TrendingDown className="w-5 h-5 text-[var(--success)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--success)]">-18%</p>
          <p className="text-sm text-[var(--foreground-muted)]">Below average</p>
        </div>

        <div className="bento-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">Efficiency Score</span>
            <Award className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <p className="text-2xl font-bold">82/100</p>
          <p className="text-sm text-[var(--foreground-muted)]">Top 15%</p>
        </div>

        <div className="bento-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">Model Mix</span>
            <TrendingUp className="w-5 h-5 text-[var(--success)]" />
          </div>
          <p className="text-2xl font-bold">65%</p>
          <p className="text-sm text-[var(--foreground-muted)]">Cost-effective models</p>
        </div>

        <div className="bento-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">Rank</span>
            <Users className="w-5 h-5 text-[var(--foreground-muted)]" />
          </div>
          <p className="text-2xl font-bold">#5</p>
          <p className="text-sm text-[var(--foreground-muted)]">of 156 companies</p>
        </div>
      </div>

      {/* Cost Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card">
          <h3 className="text-lg font-display font-bold mb-4">Cost Comparison Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={benchmarkData}>
                <defs>
                  <linearGradient id="colorIndustry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorYour" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#40A83E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#40A83E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--foreground-muted)" fontSize={12} />
                <YAxis stroke="var(--foreground-muted)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value}`, '']}
                />
                <Area type="monotone" dataKey="industry" stroke="#6366f1" fill="url(#colorIndustry)" name="Industry Avg" />
                <Area type="monotone" dataKey="yourAvg" stroke="#40A83E" fill="url(#colorYour)" name="Your Avg" />
                <Area type="monotone" dataKey="topPerformer" stroke="#22c55e" fill="transparent" name="Top Performer" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#6366f1]" />
              <span className="text-sm text-[var(--foreground-muted)]">Industry Avg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
              <span className="text-sm text-[var(--foreground-muted)]">Your Avg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
              <span className="text-sm text-[var(--foreground-muted)]">Top Performer</span>
            </div>
          </div>
        </div>

        {/* Model Performance */}
        <div className="bento-card">
          <h3 className="text-lg font-display font-bold mb-4">Model Performance Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Model</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Cost/1K</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Latency</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Quality</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-[var(--foreground-muted)]">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {modelPerformance.map((model) => (
                  <tr key={model.model} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-secondary)]">
                    <td className="py-3 px-2 font-medium">{model.model}</td>
                    <td className="text-right py-3 px-2">${model.costPer1k.toFixed(3)}</td>
                    <td className="text-right py-3 px-2">{model.latency}ms</td>
                    <td className="text-right py-3 px-2">
                      <span className="inline-flex items-center gap-1">
                        {model.quality}
                        <div className="w-12 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent)] rounded-full"
                            style={{ width: `${model.quality}%` }}
                          />
                        </div>
                      </span>
                    </td>
                    <td className="text-right py-3 px-2">
                      <span className={`font-medium ${model.efficiency >= 90 ? 'text-[var(--success)]' : model.efficiency >= 80 ? 'text-[var(--warning)]' : 'text-[var(--foreground)]'}`}>
                        {model.efficiency}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bento-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold">Industry Leaderboard</h3>
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
            <Info className="w-4 h-4" />
            <span>Anonymous comparison</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Organization</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Cost Reduction</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Monthly Requests</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[var(--foreground-muted)]">Trend</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.rank}
                  className={`border-b border-[var(--border)]/50 hover:bg-[var(--surface-secondary)] ${
                    entry.company === 'Your Organization' ? 'bg-[var(--accent)]/5' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                      entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                      entry.rank === 3 ? 'bg-orange-500/20 text-orange-500' :
                      'bg-[var(--surface-secondary)]'
                    }`}>
                      {entry.rank}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {entry.company}
                    {entry.company === 'Your Organization' && (
                      <span className="ml-2 text-xs text-[var(--accent)]">(You)</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className="text-[var(--success)] font-medium">-{entry.costReduction}%</span>
                  </td>
                  <td className="text-right py-3 px-4 text-[var(--foreground-muted)]">{entry.requests}</td>
                  <td className="text-right py-3 px-4">
                    {entry.trend === 'up' ? (
                      <ArrowUpRight className="w-5 h-5 text-[var(--success)] inline" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-[var(--error)] inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
