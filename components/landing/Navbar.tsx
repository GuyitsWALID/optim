'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--primary)] text-[var(--primary)] hover:opacity-90 transition-colors"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Menu
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={closeMenu}
            className="md:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-md"
          />
          <div className="md:hidden relative z-10 border-t border-[var(--border)] bg-[var(--background)] px-4 sm:px-6 py-4">
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
        </>
      )}
    </nav>
  )
}
