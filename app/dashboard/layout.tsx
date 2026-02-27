'use client'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  Key,
  Lightbulb,
  TrendingUp,
  Settings,
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || 'Dashboard'

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

        {/* Bottom section */}
        <div className="absolute bottom-6 left-4 right-4">
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
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <span className="text-white text-sm font-medium">W</span>
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
