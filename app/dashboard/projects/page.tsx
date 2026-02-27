'use client'

import { useState } from 'react'
import { Plus, MoreVertical, Search, FolderKanban, Trash2, Edit2, ExternalLink } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  apiKeys: number
  requests: number
  cost: number
  lastActivity: string
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Production API',
    description: 'Main production environment for customer-facing features',
    apiKeys: 3,
    requests: 15420,
    cost: 245.80,
    lastActivity: '2 hours ago',
  },
  {
    id: '2',
    name: 'Development',
    description: 'Development and testing environment',
    apiKeys: 2,
    requests: 5230,
    cost: 45.20,
    lastActivity: '1 day ago',
  },
  {
    id: '3',
    name: 'Internal Tools',
    description: 'Internal automation and reporting tools',
    apiKeys: 1,
    requests: 2100,
    cost: 18.50,
    lastActivity: '3 days ago',
  },
]

export default function ProjectsPage() {
  const [projects] = useState<Project[]>(mockProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--foreground-muted)]">Manage your projects and track costs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-12"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bento-card text-center py-16">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-[var(--foreground-muted)] mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bento-card group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <button className="p-2 hover:bg-[var(--surface-secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-5 h-5 text-[var(--foreground-muted)]" />
                </button>
              </div>

              <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
              <p className="text-sm text-[var(--foreground-muted)] mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-[var(--border)]">
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">API Keys</p>
                  <p className="font-semibold">{project.apiKeys}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">Requests</p>
                  <p className="font-semibold">{(project.requests / 1000).toFixed(1)}k</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">Cost</p>
                  <p className="font-semibold text-[var(--accent)]">${project.cost.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-sm text-[var(--foreground-muted)]">
                  {project.lastActivity}
                </span>
                <button className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1">
                  View <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
