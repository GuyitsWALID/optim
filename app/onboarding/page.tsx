'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, ArrowLeft } from 'lucide-react'

// Types
interface OnboardingData {
  useCases: string[]
  projectType: 'company' | 'personal' | null
  teamSize?: string
  industry?: string
  role?: string
  usageFrequency?: string
  expertiseLevel?: string
  currentProviders?: string[]
  monthlySpend?: string
}

const USE_CASE_OPTIONS = [
  { id: 'cost-tracking', label: 'Cost tracking & monitoring', description: 'Track and visualize LLM spending across projects' },
  { id: 'cost-optimization', label: 'LLM cost optimization', description: 'Reduce AI costs through routing and optimization' },
  { id: 'benchmarking', label: 'API performance benchmarking', description: 'Compare latency and performance across providers' },
  { id: 'analytics', label: 'AI spending analytics', description: 'Detailed insights into AI expenditure' },
]

const TEAM_SIZE_OPTIONS = [
  { id: '1-10', label: '1-10' },
  { id: '11-50', label: '11-50' },
  { id: '51-200', label: '51-200' },
  { id: '200+', label: '200+' },
]

const INDUSTRY_OPTIONS = [
  { id: 'technology', label: 'Technology' },
  { id: 'finance', label: 'Finance' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'retail', label: 'Retail' },
  { id: 'other', label: 'Other' },
]

const ROLE_OPTIONS = [
  { id: 'developer', label: 'Developer' },
  { id: 'product-manager', label: 'Product Manager' },
  { id: 'executive', label: 'Executive' },
  { id: 'data-scientist', label: 'Data Scientist' },
  { id: 'other', label: 'Other' },
]

const USAGE_FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'occasional', label: 'Occasional' },
]

const EXPERTISE_OPTIONS = [
  { id: 'beginner', label: 'Beginner', description: 'Just getting started with LLMs' },
  { id: 'intermediate', label: 'Intermediate', description: 'Comfortable with basic API usage' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced with LLM optimization' },
]

const PROVIDER_OPTIONS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'google', label: 'Google' },
  { id: 'azure', label: 'Azure OpenAI' },
  { id: 'aws', label: 'AWS Bedrock' },
  { id: 'other', label: 'Other' },
]

const SPEND_OPTIONS = [
  { id: 'under-100', label: 'Under $100/mo' },
  { id: '100-500', label: '$100 - $500/mo' },
  { id: '500-1000', label: '$500 - $1,000/mo' },
  { id: '1000-5000', label: '$1,000 - $5,000/mo' },
  { id: 'over-5000', label: 'Over $5,000/mo' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    useCases: [],
    projectType: null,
  })

  useEffect(() => {
    setMounted(true)
    // Check if onboarding is already completed
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/v1/user/preferences')
      const data = await res.json()
      if (data.preferences) {
        // Already completed, redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const toggleUseCase = (id: string) => {
    setData((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(id)
        ? prev.useCases.filter((uc) => uc !== id)
        : [...prev.useCases, id],
    }))
  }

  const toggleProvider = (id: string) => {
    setData((prev) => ({
      ...prev,
      currentProviders: prev.currentProviders?.includes(id)
        ? prev.currentProviders.filter((p) => p !== id)
        : [...(prev.currentProviders || []), id],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        console.error('Onboarding failed')
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.useCases.length > 0
      case 2:
        if (!data.projectType) return false
        if (data.projectType === 'company') {
          return data.teamSize && data.industry && data.role
        }
        return data.usageFrequency && data.expertiseLevel
      default:
        return true
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">
              Step {step} of 3
            </span>
            <span className="text-sm text-[var(--foreground-muted)]">
              {step === 1 && 'Select your use cases'}
              {step === 2 && 'Tell us about your project'}
              {step === 3 && 'Optional: Current setup'}
            </span>
          </div>
          <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Use Cases */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">What brings you here?</h1>
              <p className="text-[var(--foreground-secondary)]">
                Select all the use cases that match your goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {USE_CASE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleUseCase(option.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    data.useCases.includes(option.id)
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${
                      data.useCases.includes(option.id)
                        ? 'border-[var(--primary)] bg-[var(--primary)]'
                        : 'border-[var(--border)]'
                    }`}>
                      {data.useCases.includes(option.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-[var(--foreground-muted)]">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Project Type */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">What type of project is this?</h1>
              <p className="text-[var(--foreground-secondary)]">
                We'll personalize your experience based on your choice
              </p>
            </div>

            {/* Project Type Selection */}
            {!data.projectType ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => updateData({ projectType: 'company' })}
                  className="p-6 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-all text-left"
                >
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="font-semibold text-lg">Company</div>
                  <div className="text-sm text-[var(--foreground-muted)]">
                    For work, business, or team projects
                  </div>
                </button>
                <button
                  onClick={() => updateData({ projectType: 'personal' })}
                  className="p-6 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-all text-left"
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-semibold text-lg">Personal</div>
                  <div className="text-sm text-[var(--foreground-muted)]">
                    For learning, experiments, or hobby projects
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Company-specific questions */}
                {data.projectType === 'company' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Team Size</label>
                      <div className="flex flex-wrap gap-2">
                        {TEAM_SIZE_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateData({ teamSize: option.id })}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              data.teamSize === option.id
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Industry</label>
                      <div className="flex flex-wrap gap-2">
                        {INDUSTRY_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateData({ industry: option.id })}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              data.industry === option.id
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your Role</label>
                      <div className="flex flex-wrap gap-2">
                        {ROLE_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateData({ role: option.id })}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              data.role === option.id
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Personal-specific questions */}
                {data.projectType === 'personal' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">How often do you use LLMs?</label>
                      <div className="flex flex-wrap gap-2">
                        {USAGE_FREQUENCY_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateData({ usageFrequency: option.id })}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              data.usageFrequency === option.id
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your Expertise Level</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {EXPERTISE_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateData({ expertiseLevel: option.id })}
                            className={`p-4 rounded-lg border text-left transition-all ${
                              data.expertiseLevel === option.id
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-[var(--foreground-muted)]">
                              {option.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={() => updateData({ projectType: null })}
                  className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                  ← Change project type
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Current Setup (Optional) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Current Setup (Optional)</h1>
              <p className="text-[var(--foreground-secondary)]">
                Help us understand your current setup for better recommendations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Which LLM providers are you currently using?
              </label>
              <div className="flex flex-wrap gap-2">
                {PROVIDER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleProvider(option.id)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      data.currentProviders?.includes(option.id)
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                What's your estimated monthly LLM spend?
              </label>
              <div className="flex flex-wrap gap-2">
                {SPEND_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateData({ monthlySpend: option.id })}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      data.monthlySpend === option.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              step === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                canProceed()
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--border)] text-[var(--foreground-muted)] cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--primary)] text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Get Started'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
