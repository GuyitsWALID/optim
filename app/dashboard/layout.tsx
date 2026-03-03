'use client'

import { useState, useRef, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/useSession'
import {
  LayoutDashboard,
  FolderKanban,
  Key,
  Lightbulb,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/recommendations', label: 'Recommendations', icon: Lightbulb },
  { href: '/dashboard/benchmarks', label: 'Benchmarks', icon: TrendingUp },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/projects': 'Projects',
  '/dashboard/keys': 'API Keys',
  '/dashboard/recommendations': 'Recommendations',
  '/dashboard/benchmarks': 'Benchmarks',
  '/dashboard/settings': 'Settings',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || 'Dashboard'
  const { user, loading, signOut } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.name ? getInitials(user.name) : '?'
  const displayName = user?.name || 'User'

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] p-4 hidden lg:block">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 px-3">
          <img src="logo3.png" alt="OPTIM Logo" className='h-9 w-9'/>
          <img src="logo2.png" alt="OPTIM Logo" className='h-7 w-17'/>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25'
                    : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section - User profile + Settings */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              pathname === '/dashboard/settings'
                ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25'
                : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>

          {/* User info in sidebar */}
          <div className="border-t border-[var(--border)] pt-3 mt-2">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-all duration-200"
            >
              {user?.image ? (
                <img src={user.image} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">{initials}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-[var(--foreground-muted)] truncate">{user?.email || ''}</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur-sm border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold text-2xl">{pageTitle}</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user?.image ? (
                    <img src={user.image} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{initials}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
                  <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-[var(--border)]">
                      <p className="font-medium truncate">{displayName}</p>
                      <p className="text-sm text-[var(--foreground-muted)] truncate">{user?.email || ''}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          signOut()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--error,#ef4444)] hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
