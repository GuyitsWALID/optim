'use client'

import Link from 'next/link'

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bento-card text-center py-16 px-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 diagonal-accent opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Start Optimizing Today
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] mb-8 max-w-xl mx-auto">
              Join thousands of teams saving up to 85% on their AI costs.
              No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                Get Started Free
              </Link>
              <Link href="#demo" className="btn-secondary text-lg px-8 py-4">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
