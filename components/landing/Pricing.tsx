'use client'

import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '1 project',
      '10,000 requests/month',
      'Basic dashboard',
      'Cost tracking',
      '7-day data retention',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing teams',
    features: [
      'Unlimited projects',
      'Unlimited requests',
      'AI recommendations',
      'Smart routing',
      'Alerts & budgets',
      'Industry benchmarking',
      '1-year data retention',
      'Email support',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$499',
    period: '/month',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'SSO / SAML',
      'Dedicated support',
      'SLA guarantee',
      'Unlimited data retention',
      'Custom contracts',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                bento-card relative flex flex-col
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
                <span className="text-4xl font-display font-bold">{plan.price}</span>
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
              <Link
                href="/dashboard"
                className={`
                  w-full text-center py-3 rounded-lg font-medium transition-all
                  ${plan.highlighted
                    ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-secondary)]'
                    : 'border-2 border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }
                `}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ hint */}
        <p className="text-center mt-12 text-[var(--foreground-muted)]">
          Need a custom plan?{' '}
          <Link href="/contact" className="text-[var(--accent)] hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </section>
  )
}
