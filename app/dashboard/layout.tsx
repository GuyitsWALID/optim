'use client'

import { useState, useRef, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/useSession'
import {
  LayoutDashboard,
  FolderKanban,
  Lightbulb,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  ScrollText,
  Layers,
  Wallet,
} from 'lucide-react'

interface NavSection {
  label: string
  items: { href: string; label: string; icon: typeof LayoutDashboard }[]
}

const navSections: NavSection[] = [
  {
    label: '',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/logs', label: 'Usage Logs', icon: ScrollText },
      { href: '/dashboard/benchmarks', label: 'Benchmarks', icon: TrendingUp },
    ],
  },
  {
    label: 'OPTIMIZE',
    items: [
      { href: '/dashboard/recommendations', label: 'Recommendations', icon: Lightbulb },
      { href: '/dashboard/models', label: 'Model Catalog', icon: Layers },
    ],
  },
  {
    label: 'MANAGE',
    items: [
      { href: '/dashboard/budgets', label: 'Budgets & Alerts', icon: Wallet },
    ],
  },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/projects': 'Projects',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/logs': 'Usage Logs',
  '/dashboard/benchmarks': 'Benchmarks',
  '/dashboard/recommendations': 'Recommendations',
  '/dashboard/models': 'Model Catalog',
  '/dashboard/budgets': 'Budgets & Alerts',
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const initials = user?.name ? getInitials(user.name) : '?'
  const displayName = user?.name || 'User'

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] p-4 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:z-auto`}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 px-3">
          <img src="logo3.png" alt="OPTIM Logo" className='h-9 w-9'/>
          <img src="logo2.png" alt="OPTIM Logo" className='h-7 w-17'/>
        </Link>

        {/* Navigation */}
        <nav className="space-y-4 overflow-y-auto max-h-[calc(100vh-280px)]">
          {navSections.map((section, idx) => (
            <div key={idx}>
              {section.label && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-[var(--foreground-muted)] uppercase">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25'
                          : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : ''}`} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
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
        <header className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur-sm border-b border-[var(--border)] px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-display font-bold text-xl sm:text-2xl">{pageTitle}</h1>
            </div>
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
