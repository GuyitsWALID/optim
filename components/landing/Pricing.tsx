'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-1000 employees',
  '1000+ employees',
] as const

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individual developers and side projects',
    features: [
      '1 project',
      '10,000 requests/month',
      'Real-time cost dashboard',
      'Per-model spend tracking',
      '7-day data retention',
    ],
    cta: 'Start Free',
    action: 'signup' as const,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month ($39/mo annually)',
    description: 'For teams shipping AI products in production',
    features: [
      '10 projects',
      '500,000 requests/month',
      'AI-powered recommendations',
      'Smart model routing',
      'Alerts & budget caps',
      'Industry benchmarking',
      '90-day data retention',
      'Priority email support',
    ],
    cta: 'Upgrade to Pro',
    action: 'checkout' as const,
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'From $299',
    period: '/month',
    description: 'For organizations that need compliance, scale, and dedicated support',
    features: [
      'Everything in Pro',
      'Unlimited projects',
      'Unlimited requests',
      'SSO / SAML',
      'Dedicated account manager',
      '99.9% SLA guarantee',
      '1-year+ data retention',
      'Custom integrations & contracts',
    ],
    cta: 'Get Enterprise',
    action: 'enterprise' as const,
    highlighted: false,
  },
]

export function Pricing() {
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [useCase, setUseCase] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowEnterpriseModal(false)
      }
    }
    if (showEnterpriseModal) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [showEnterpriseModal])

  // Close modal on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowEnterpriseModal(false)
    }
    if (showEnterpriseModal) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showEnterpriseModal])

  const handleEnterpriseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      plan: 'enterprise',
      company: companyName,
      size: companySize,
      ...(useCase ? { useCase } : {}),
    })
    window.location.href = `/sign-up?${params.toString()}`
  }

  return (
    <section id="pricing" className="py-16 sm:py-20 md:py-32 bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-base sm:text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                bento-card relative flex flex-col max-w-md md:max-w-none mx-auto w-full
                ${plan.highlighted ? 'border-[var(--accent)] border-2' : ''}
              `}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--accent)] text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-[var(--foreground-secondary)] text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-display font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-[var(--foreground-muted)]">{plan.period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-[var(--success)]">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.action === 'signup' && (
                <Link
                  href="/sign-up"
                  className="w-full text-center py-3 rounded-lg font-medium transition-all border-2 border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {plan.cta}
                </Link>
              )}

              {plan.action === 'checkout' && (
                <div className="space-y-2">
                  <Link
                    href="/sign-up?plan=pro&cycle=monthly"
                    className="w-full text-center py-3 rounded-lg font-medium transition-all bg-[var(--accent)] text-white hover:bg-[var(--accent-secondary)] block"
                  >
                    Choose Monthly
                  </Link>
                  <Link
                    href="/sign-up?plan=pro&cycle=annual"
                    className="w-full text-center py-3 rounded-lg font-medium transition-all border-2 border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] block"
                  >
                    Choose Annual (save 20%)
                  </Link>
                </div>
              )}

              {plan.action === 'enterprise' && (
                <button
                  onClick={() => setShowEnterpriseModal(true)}
                  className="w-full text-center py-3 rounded-lg font-medium transition-all border-2 border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ hint */}
        <p className="text-center mt-12 text-[var(--foreground-muted)]">
          Need a custom plan?{' '}
          <a href="mailto:sales@optim.dev" className="text-[var(--accent)] hover:underline">
            Contact us
          </a>
        </p>
      </div>

      {/* Enterprise Modal */}
      {showEnterpriseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div ref={modalRef} className="bento-card w-full max-w-lg p-6 sm:p-8 relative">
            {/* Close button */}
            <button
              onClick={() => setShowEnterpriseModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--surface-elevated)] transition-colors text-[var(--foreground-muted)]"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>

            <h3 className="text-2xl font-display font-bold mb-2">Enterprise Plan</h3>
            <p className="text-[var(--foreground-secondary)] text-sm mb-6">
              Tell us about your organization so we can tailor the right plan for you.
            </p>

            <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-field w-full"
                  placeholder="Acme Inc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company Size</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="input-field w-full"
                  required
                >
                  <option value="" disabled>
                    Select company size
                  </option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Primary Use Case <span className="text-[var(--foreground-muted)]">(optional)</span>
                </label>
                <textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="input-field w-full h-20 resize-none"
                  placeholder="e.g. We run 2M+ LLM calls/month across 30 microservices..."
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3"
              >
                Continue to Sign Up
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
