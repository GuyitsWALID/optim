'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it Works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#testimonials', label: 'Testimonials' },
  ]

  const closeMenu = () => setIsMenuOpen(false)

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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
          <button
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--foreground-muted)] transition-colors"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Menu
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur px-6 py-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors py-1"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/sign-in"
              onClick={closeMenu}
              className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors font-medium py-1"
            >
              Sign In
            </Link>
            <Link href="/sign-up" onClick={closeMenu} className="btn-primary text-sm text-center mt-2">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
