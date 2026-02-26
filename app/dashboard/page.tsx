import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bento-card">
        <h2 className="text-2xl font-display font-bold mb-2">Welcome to Optim!</h2>
        <p className="text-[var(--foreground-secondary)] mb-4">
          Track, analyze, and optimize your AI costs. Get started by adding your first API key.
        </p>
        <Link href="/dashboard/keys" className="btn-primary inline-block">
          Add API Key
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spend */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--foreground-muted)] text-sm">Total Spend</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-display font-bold text-[var(--accent)]">$0</p>
          <p className="text-sm text-[var(--foreground-muted)] mt-2">This month</p>
        </div>

        {/* API Requests */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--foreground-muted)] text-sm">API Requests</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-display font-bold">0</p>
          <p className="text-sm text-[var(--foreground-muted)] mt-2">This month</p>
        </div>

        {/* Savings */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--foreground-muted)] text-sm">Potential Savings</span>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-3xl font-display font-bold text-[var(--success)]">$0</p>
          <p className="text-sm text-[var(--foreground-muted)] mt-2">Available now</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bento-card">
        <h3 className="text-lg font-display font-bold mb-4">Recent Activity</h3>
        <div className="text-center py-12 text-[var(--foreground-muted)]">
          <p className="mb-2">No activity yet</p>
          <p className="text-sm">Connect an API key to start tracking your AI costs</p>
        </div>
      </div>
    </div>
  )
}
