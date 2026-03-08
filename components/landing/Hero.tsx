'use client'

import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-20 md:pt-40 md:pb-32 overflow-hidden">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] mb-6 sm:mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
            </span>
            <span className="text-xs sm:text-sm font-modern text-[var(--foreground-secondary)]">
              Trusted by AI-first engineering teams
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-[1.1] mb-5 sm:mb-6 animate-slide-up tracking-tight">
            Stop Overpaying for{' '}
            <span className="relative">
              <span className="relative z-10">AI</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-[var(--accent)]/20 -z-10" />
            </span>{' '}
            — Cut Costs by <span className="gradient-text">Up to 85%</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-[var(--foreground-secondary)] mb-8 sm:mb-10 max-w-2xl mx-auto animate-slide-up font-modern leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Optim tracks every LLM call across OpenAI, Anthropic, Groq, and 50+ providers — then uses AI to recommend cheaper models, smarter routing, and automatic optimizations so you ship faster and spend less.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/sign-up" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto font-modern">
              Start Free — No Credit Card
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto font-modern">
              See How It Works
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-10 sm:mt-16 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '85%', label: 'Cost Reduction' },
              { value: '50+', label: 'AI Providers' },
              { value: '2 min', label: 'Setup Time' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 sm:p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <p className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[var(--accent)]">{stat.value}</p>
                <p className="text-xs text-[var(--foreground-muted)] font-modern">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-12 sm:mt-16 md:mt-20 relative animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {/* Floating elements */}
          <div className="hidden sm:flex absolute -top-6 -left-6 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg animate-fade-in items-center gap-2">
            <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span className="text-sm font-modern">Smart Routing Active</span>
          </div>
          <div className="hidden sm:flex absolute -bottom-6 -right-6 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg animate-fade-in items-center gap-2">
            <svg className="w-4 h-4 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            <span className="text-sm font-modern">$2,450/mo saved</span>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-[var(--accent)]/5">
            {/* Mock dashboard header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-4 flex items-center gap-2 text-xs text-[var(--foreground-muted)] font-mono">
                <span>optim.dev/dashboard</span>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Stats */}
              <div className="col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
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
              <div className="col-span-1 lg:col-span-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-4 h-48 sm:h-56 flex items-end justify-between gap-2">
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
