import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] p-6 hidden lg:block">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="font-display font-bold text-xl">OPTIM</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] font-medium">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/dashboard/projects" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] transition-colors">
            <span>📁</span> Projects
          </Link>
          <Link href="/dashboard/keys" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] transition-colors">
            <span>🔑</span> API Keys
          </Link>
          <Link href="/dashboard/recommendations" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] transition-colors">
            <span>💡</span> Recommendations
          </Link>
          <Link href="/dashboard/benchmarks" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] transition-colors">
            <span>📈</span> Benchmarks
          </Link>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-6 left-6 right-6">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] transition-colors">
            <span>⚙️</span> Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur-sm border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold text-xl">Dashboard</h1>
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
