'use client'

import Link from 'next/link'

export function CTA() {
  return (
    <section className="py-16 sm:py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bento-card text-center py-12 sm:py-16 px-4 sm:px-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 diagonal-accent opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
              Stop guessing. Start optimizing.
            </h2>
            <p className="text-base sm:text-lg text-[var(--foreground-secondary)] mb-8 max-w-xl mx-auto">
              Two lines of code. Real-time cost visibility. AI-powered savings.
              Free forever on the starter plan — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/sign-up" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                Start Free
              </Link>
              <Link href="#pricing" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
