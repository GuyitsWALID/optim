'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Check, Loader2 } from 'lucide-react'

const PLAN_DETAILS: Record<string, { name: string; features: string[] }> = {
  pro: {
    name: 'Pro',
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
            <span>Secure checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Plan summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                Upgrade to {planInfo.name}
              </h1>
              <p className="text-[var(--foreground-secondary)] mb-6">
                {cycle === 'annual' ? 'Annual billing' : 'Monthly billing'}
                {plan === 'pro' && cycle === 'annual' && (
                  <span className="ml-2 text-[var(--accent)] font-medium">Save 20%</span>
                )}
              </p>

              {/* Plan features */}
              <div className="card p-6">
                <h3 className="font-semibold mb-4">{planInfo.name} plan includes:</h3>
                <ul className="space-y-3">
                  {planInfo.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skip for now */}
              <div className="mt-6 text-center">
                <Link
                  href="/dashboard"
                  className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)] transition-colors"
                >
                  Skip for now — continue with Free plan
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Whop checkout iframe */}
          <div className="lg:col-span-3">
            <div className="card overflow-hidden" style={{ minHeight: '600px' }}>
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] mb-4" />
                  <p className="text-[var(--foreground-secondary)]">Preparing checkout...</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-primary px-6 py-2"
                  >
                    Try again
                  </button>
                </div>
              )}

              {checkoutUrl && !error && (
                <iframe
                  src={checkoutUrl}
                  className="w-full border-0"
                  style={{ minHeight: '600px', height: '100%' }}
                  title="Whop Checkout"
                  allow="payment"
                />
              )}
            </div>
          </div>
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
