'use client'

import { useState, useEffect } from 'react'
import { User, Save, Loader2, CreditCard, ArrowUpRight } from 'lucide-react'
import { useSession } from '@/lib/useSession'
import { useDashboardStore } from '@/lib/store'

export default function SettingsPage() {
  const { user, loading: sessionLoading } = useSession()
  const { userPreferences, billing, fetchBilling, loadingBilling } = useDashboardStore()

  // Profile form state - populated from real user data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ')
      setFirstName(nameParts[0] || '')
      setLastName(nameParts.slice(1).join(' ') || '')
      setEmail(user.email || '')
    }
    if (userPreferences?.industry) {
      setCompany(userPreferences.industry)
    }
  }, [user, userPreferences])

  useEffect(() => {
    fetchBilling()
  }, [fetchBilling])

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const initials = user?.name ? getInitials(user.name) : '?'

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMessage('')
    try {
      const res = await fetch('/api/v1/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName, lastName, email, company }),
      })
      if (res.ok) {
        setSaveMessage('Profile saved successfully')
      } else {
        setSaveMessage('Failed to save profile')
      }
    } catch {
      setSaveMessage('Failed to save profile')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleUpgradeToPro = async (billingCycle: 'monthly' | 'annual') => {
    try {
      const res = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ billingCycle }),
      })

      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
    }
  }

  const requestPct =
    billing?.limits.requestsPerMonth && billing.limits.requestsPerMonth > 0
      ? Math.min(100, (billing.usage.requestsThisMonth / billing.limits.requestsPerMonth) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
          Manage your profile and account preferences
        </p>
      </div>

      <div
        className="p-6 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <User className="w-5 h-5" /> Profile
        </h2>
        {sessionLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--foreground-muted)' }} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              {user?.image ? (
                <img src={user.image} alt={user.name || 'User'} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                  <span className="text-white text-2xl font-bold">{initials}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-lg">{user?.name || 'User'}</p>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{user?.email || ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 rounded-lg text-sm outline-none opacity-60 cursor-not-allowed"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Company / Industry</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              />
            </div>

            {userPreferences && (
              <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <h3 className="font-medium mb-3">Onboarding Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {userPreferences.projectType && (
                    <div>
                      <p style={{ color: 'var(--foreground-muted)' }}>Project Type</p>
                      <p className="font-medium capitalize">{userPreferences.projectType}</p>
                    </div>
                  )}
                  {userPreferences.role && (
                    <div>
                      <p style={{ color: 'var(--foreground-muted)' }}>Role</p>
                      <p className="font-medium capitalize">{userPreferences.role.replace('-', ' ')}</p>
                    </div>
                  )}
                  {userPreferences.expertiseLevel && (
                    <div>
                      <p style={{ color: 'var(--foreground-muted)' }}>Expertise</p>
                      <p className="font-medium capitalize">{userPreferences.expertiseLevel}</p>
                    </div>
                  )}
                  {userPreferences.teamSize && (
                    <div>
                      <p style={{ color: 'var(--foreground-muted)' }}>Team Size</p>
                      <p className="font-medium">{userPreferences.teamSize}</p>
                    </div>
                  )}
                  {userPreferences.monthlySpend && (
                    <div>
                      <p style={{ color: 'var(--foreground-muted)' }}>Monthly Spend</p>
                      <p className="font-medium">{userPreferences.monthlySpend}</p>
                    </div>
                  )}
                  {userPreferences.useCases && userPreferences.useCases.length > 0 && (
                    <div className="col-span-2">
                      <p style={{ color: 'var(--foreground-muted)' }}>Use Cases</p>
                      <p className="font-medium">{userPreferences.useCases.map(uc => uc.replace(/-/g, ' ')).join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                {saveMessage}
              </p>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div
        className="p-6 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Billing
        </h2>

        {loadingBilling ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--foreground-muted)' }} />
          </div>
        ) : billing ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Current plan</p>
                <p className="text-xl font-bold">{billing.tier}</p>
                {billing.subscription?.status && (
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    Subscription status: {billing.subscription.status}
                  </p>
                )}
              </div>
              {billing.tier === 'FREE' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpgradeToPro('monthly')}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    Upgrade Monthly
                  </button>
                  <button
                    onClick={() => handleUpgradeToPro('annual')}
                    className="px-4 py-2 rounded-lg text-sm font-medium border"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Upgrade Annual
                  </button>
                </div>
              ) : billing.manageUrl ? (
                <a
                  href={billing.manageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: 'var(--border)' }}
                >
                  Manage Subscription <ArrowUpRight className="w-4 h-4" />
                </a>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: 'var(--foreground-muted)' }}>Requests this month</span>
                <span>
                  {billing.usage.requestsThisMonth.toLocaleString()}
                  {billing.limits.requestsPerMonth ? ` / ${billing.limits.requestsPerMonth.toLocaleString()}` : ''}
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'var(--surface-secondary)' }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${requestPct}%`,
                    background: requestPct > 90 ? 'var(--error)' : requestPct >= 70 ? 'var(--warning)' : 'var(--success, #22c55e)',
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Billing data unavailable.</p>
        )}
      </div>
    </div>
  )
}
