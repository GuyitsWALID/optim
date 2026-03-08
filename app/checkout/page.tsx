'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Check, Loader2, ExternalLink, Zap, CreditCard } from 'lucide-react'

const PLAN_DETAILS: Record<string, { name: string; price: string; annualPrice?: string; features: string[] }> = {
  pro: {
    name: 'Pro',
    price: '$49/mo',
    annualPrice: '$39/mo',
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
  },
  enterprise: {
    name: 'Enterprise',
    price: 'From $299/mo',
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
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const plan = searchParams.get('plan') || 'pro'
  const cycle = searchParams.get('cycle') || 'monthly'
  const company = searchParams.get('company') || ''
  const size = searchParams.get('size') || ''

  const planInfo = PLAN_DETAILS[plan] || PLAN_DETAILS.pro
  const displayPrice = cycle === 'annual' && planInfo.annualPrice ? planInfo.annualPrice : planInfo.price

  useEffect(() => {
    async function initCheckout() {
      try {
        const res = await fetch('/api/v1/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            plan,
            billingCycle: cycle,
            ...(company ? { companyName: company } : {}),
            ...(size ? { companySize: size } : {}),
          }),
        })
        const data = await res.json()
        if (res.ok && data.checkoutUrl) {
          setCheckoutUrl(data.checkoutUrl)
        } else {
          setError(data.error || 'Failed to initialize checkout')
        }
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    initCheckout()
  }, [plan, cycle, company, size])

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <img src="/logo3.png" alt="Optim" className="h-8 w-8" />
              <span className="font-display font-bold text-lg">Optim</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
            <Shield className="w-4 h-4" />
            <span>Secure checkout powered by Whop</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Plan card */}
        <div className="card p-8 sm:p-10">
          {/* Plan header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              {planInfo.name} Plan
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
              Upgrade to {planInfo.name}
            </h1>
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              {displayPrice}
            </div>
            <p className="text-[var(--foreground-secondary)]">
              {cycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
              {plan === 'pro' && cycle === 'annual' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">
                  Save 20%
                </span>
              )}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border)] my-8" />

          {/* Features grid */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-center">Everything included:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {planInfo.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border)] my-8" />

          {/* CTA */}
          <div className="text-center space-y-4">
            {loading && (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)] mb-2" />
                <p className="text-sm text-[var(--foreground-secondary)]">Preparing secure checkout...</p>
              </div>
            )}

            {error && (
              <div className="space-y-3">
                <p className="text-red-500 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary px-8 py-3"
                >
                  Try again
                </button>
              </div>
            )}

            {checkoutUrl && !error && (
              <>
                <a
                  href={checkoutUrl}
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg"
                >
                  <CreditCard className="w-5 h-5" />
                  Continue to Payment
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs text-[var(--foreground-muted)]">
                  You&apos;ll be redirected to our secure payment partner to complete your purchase
                </p>
              </>
            )}
          </div>
        </div>

        {/* Skip link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)] transition-colors"
          >
            Skip for now — continue with Free plan
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
