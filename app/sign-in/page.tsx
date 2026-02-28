'use client'

import { SignIn } from 'better-auth/react'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/logo3.png" alt="optim logo" className='h-12 w-12' />
          </Link>
          <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
          <p className="text-[var(--foreground-secondary)]">
            Sign in to your account to continue
          </p>
        </div>

        <div className="card p-6">
          <SignIn />
        </div>

        <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-[var(--primary)] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
