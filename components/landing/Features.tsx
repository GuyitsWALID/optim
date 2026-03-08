'use client'

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Real-time Cost Tracking',
    description: 'Monitor every API call, token, and dollar in real time. Get per-model, per-provider, and per-project breakdowns so you always know where your budget goes.',
    size: 'large',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: 'AI-Powered Recommendations',
    description: 'Optim analyzes your usage patterns and recommends specific model swaps, prompt optimizations, and caching strategies — each with a confidence score and estimated savings.',
    size: 'medium',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    title: 'Smart Routing',
    description: 'Automatically route queries to the optimal model based on complexity, latency, and cost — without changing a single line of your application code.',
    size: 'small',
    gradient: 'from-teal-500/20 to-cyan-500/20',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Industry Benchmarking',
    description: 'See how your AI spend compares to anonymized peers in your industry. Spot where you are overpaying relative to similar teams and workloads.',
    size: 'medium',
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: 'Alerts & Budget Caps',
    description: 'Set per-project or org-wide spending limits with real-time alerts. Get notified the moment costs approach your threshold — never get surprised by a runaway bill.',
    size: 'small',
    gradient: 'from-amber-500/20 to-yellow-500/20',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: 'Drop-in SDK',
    description: 'Two lines of code. Wrap your existing OpenAI-compatible client with wrapOpenAI() and Optim handles the rest — zero vendor lock-in, works with 50+ providers.',
    size: 'small',
    gradient: 'from-slate-500/20 to-gray-500/20',
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 md:py-32 bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
            Everything you need to cut AI costs
          </h2>
          <p className="text-base sm:text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            From real-time visibility to AI-driven optimization — the complete toolkit for teams serious about controlling LLM spend.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                relative overflow-hidden group
                ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                ${feature.size === 'medium' ? 'md:col-span-2' : ''}
              `}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Card */}
              <div className="relative h-full bg-[var(--surface)] border border-[var(--border)] rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 group-hover:border-[var(--accent)]/30 group-hover:shadow-lg group-hover:shadow-[var(--accent)]/5">
                {/* Icon container */}
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg sm:text-xl font-heading font-semibold mb-2 sm:mb-3 text-[var(--foreground)]">
                    {feature.title}
                  </h3>

                  <p className="text-[var(--foreground-secondary)] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5">
                  <div className="absolute bottom-4 right-4 w-8 h-8 border border-[var(--foreground)] rounded-full" />
                  <div className="absolute bottom-6 right-6 w-4 h-4 border border-[var(--foreground)] rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
