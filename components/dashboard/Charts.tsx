'use client'

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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Optim theme colors - green accent
const THEME_COLORS = {
  primary: '#40A83E',
  primaryLight: '#40A83E',
  primaryLighter: 'rgba(64, 168, 62, 0.3)',
}

// Multi-color palette for pie chart - using green variations
const COLORS = ['#40A83E', '#2d7a2d', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#22C55E', '#4ADE80']

interface CostChartProps {
  data: { date: string; totalCost: number; totalRequests: number }[]
}

export function CostChart({ data }: CostChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="bento-card">
      <h3 className="text-lg font-display font-bold mb-4">Cost Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              stroke="var(--foreground-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--foreground-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground-secondary)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
            />
            <Area
              type="monotone"
              dataKey="totalCost"
              stroke={THEME_COLORS.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCost)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface CostByModelProps {
  data: { model: string; cost: number; requests: number }[]
}

export function CostByModel({ data }: CostByModelProps) {
  const chartData = data.slice(0, 5).map((d) => ({
    name: d.model.length > 15 ? d.model.substring(0, 15) + '...' : d.model,
    cost: d.cost,
    requests: d.requests,
  }))

  if (chartData.length === 0) {
    return (
      <div className="bento-card">
        <h3 className="text-lg font-display font-bold mb-4">Cost by Model</h3>
        <div className="h-64 flex items-center justify-center text-[var(--foreground-muted)]">
          No data yet
        </div>
      </div>
    )
  }

  return (
    <div className="bento-card">
      <h3 className="text-lg font-display font-bold mb-4">Cost by Model</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              stroke="var(--foreground-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--foreground-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground-secondary)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
            />
            <Bar
              dataKey="cost"
              fill={THEME_COLORS.primary}
              radius={[0, 4, 4, 0]}
              activeBar={{
                fill: THEME_COLORS.primaryLight,
                filter: 'brightness(1.1)',
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface CostByProviderProps {
  data: { provider: string; cost: number }[]
}

export function CostByProvider({ data }: CostByProviderProps) {
  if (data.length === 0) {
    return (
      <div className="bento-card">
        <h3 className="text-lg font-display font-bold mb-4">Cost by Provider</h3>
        <div className="h-64 flex items-center justify-center text-[var(--foreground-muted)]">
          No data yet
        </div>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.provider.charAt(0).toUpperCase() + d.provider.slice(1),
    value: d.cost,
  }))

  return (
    <div className="bento-card">
      <h3 className="text-lg font-display font-bold mb-4">Cost by Provider</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground-secondary)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        {chartData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-[var(--foreground-muted)]">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
