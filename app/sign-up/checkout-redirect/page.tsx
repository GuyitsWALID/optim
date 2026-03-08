'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CheckoutRedirectPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const plan = searchParams.get('plan') || 'pro'
    const cycle = searchParams.get('cycle') || 'monthly'
    const company = searchParams.get('company') || ''
    const size = searchParams.get('size') || ''

    async function startCheckout() {
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
          window.location.href = data.checkoutUrl
        } else {
          // Checkout failed — likely needs onboarding first
          window.location.href = '/onboarding'
        }
      } catch {
        setError('Something went wrong. Redirecting...')
        setTimeout(() => {
          window.location.href = '/onboarding'
        }, 2000)
      }
    }

    startCheckout()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--foreground-secondary)]">
          {error || 'Setting up your checkout...'}
        </p>
      </div>
    </div>
  )
}
