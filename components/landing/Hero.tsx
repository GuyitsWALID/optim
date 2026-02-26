'use client'

import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
            </span>
            <span className="text-sm font-modern text-[var(--foreground-secondary)]">
              Save up to 85% on AI costs
            </span>
          </div>

          {/* Main heading - using different fonts */}
          <h1 className="text-4xl md:text-5xl font-display font-bold leading-[1.1] mb-6 animate-slide-up tracking-tight">
            Reduce AI{' '}
            <span className="relative">
              <span className="relative z-10">Costs</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-[var(--accent)]/20 -z-10" />
            </span>{' '}
            by <span className="gradient-text">85%</span>
          </h1>

          {/* Subheading - different font */}
          <p className="text-lg md:text-xl text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto animate-slide-up font-modern leading-relaxed" style={{ animationDelay: '0.1s' }}>
            The intelligent platform that tracks, analyzes, and automatically optimizes your LLM spending across all providers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto font-modern">
              Get Started Free
            </Link>
            <Link href="#demo" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto font-modern">
              View Demo
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '85%', label: 'Max Savings' },
              { value: '50+', label: 'Providers' },
              { value: '10K+', label: 'Users' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <p className="text-2xl md:text-3xl font-display font-bold text-[var(--accent)]">{stat.value}</p>
                <p className="text-xs text-[var(--foreground-muted)] font-modern">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {/* Floating elements */}
          <div className="absolute -top-6 -left-6 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span className="text-sm font-modern">AI Optimization Active</span>
          </div>
          <div className="absolute -bottom-6 -right-6 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            <span className="text-sm font-modern">$2,450/mo saved</span>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl shadow-[var(--accent)]/5">
            {/* Mock dashboard header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-4 flex items-center gap-2 text-xs text-[var(--foreground-muted)] font-mono">
                <span>optim-dashboard</span>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {/* Stats */}
              <div className="col-span-1 space-y-3">
                <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-4">
                  <p className="text-xs text-[var(--foreground-muted)] font-modern uppercase tracking-wider">Total Spend</p>
                  <p className="text-2xl font-display font-bold text-[var(--accent)]">$4,230</p>
                  <p className="text-xs text-[var(--success)] font-modern flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                    23% from last month
                  </p>
                </div>
                <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-4">
                  <p className="text-xs text-[var(--foreground-muted)] font-modern uppercase tracking-wider">API Requests</p>
                  <p className="text-2xl font-display font-bold">125.4K</p>
                </div>
                <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-4">
                  <p className="text-xs text-[var(--foreground-muted)] font-modern uppercase tracking-wider">Savings</p>
                  <p className="text-2xl font-display font-bold text-[var(--success)]">45%</p>
                </div>
              </div>
              {/* Chart placeholder */}
              <div className="col-span-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-4 flex items-end justify-between gap-2">
                {[65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 70, 65].map((height, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-[var(--accent)] to-[var(--accent)]/50 rounded-t transition-all hover:from-[var(--accent)]/80" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
