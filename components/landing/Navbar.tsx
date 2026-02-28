'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo3.png" alt="optim logo" className='h-9 w-9' />
          <img src="/logo2.png" alt="Optim text" className="h-9 w-25" />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
            How it Works
          </Link>
          <Link href="#pricing" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
            Testimonials
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="hidden sm:block text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link href="/sign-up" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
