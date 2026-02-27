'use client'

import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Clock } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: 'dollar' | 'activity' | 'zap' | 'clock'
  trend?: {
    value: number
    isPositive: boolean
  }
}

const iconMap = {
  dollar: DollarSign,
  activity: Activity,
  zap: Zap,
  clock: Clock,
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  const Icon = iconMap[icon]

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[var(--foreground-muted)] text-sm">{title}</span>
        <span className="text-2xl">
          <Icon className="w-6 h-6 text-[var(--accent)]" />
        </span>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-display font-bold">{value}</p>
        {trend && (
          <span className={`flex items-center text-sm mb-1 ${
            trend.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'
          }`}>
            {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-[var(--foreground-muted)] mt-2">{subtitle}</p>
      )}
    </div>
  )
}
