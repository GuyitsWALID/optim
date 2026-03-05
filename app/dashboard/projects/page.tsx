'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, FolderKanban, ExternalLink, Copy, Check, X, Terminal } from 'lucide-react'
import { useDashboardStore, type Project } from '@/lib/store'
import { ProviderIcon } from '@/components/dashboard/ProviderIcon'
import { CodeBlock } from '@/components/ui/CodeBlock'
import Link from 'next/link'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google Gemini' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'qwen', label: 'Qwen (Alibaba)' },
  { value: 'mistral', label: 'Mistral AI' },
  { value: 'zhipu', label: 'Zhipu (GLM)' },
  { value: 'moonshot', label: 'Moonshot (Kimi)' },
  { value: 'minimax', label: 'MiniMax' },
  { value: 'yi', label: '01.AI (Yi)' },
  { value: 'groq', label: 'Groq' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'bedrock', label: 'AWS Bedrock' },
]

const MODELS_BY_PROVIDER: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-4.1', label: 'GPT-4.1' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'o3', label: 'o3' },
    { value: 'o3-mini', label: 'o3 Mini' },
    { value: 'o1', label: 'o1' },
    { value: 'o1-mini', label: 'o1 Mini' },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  ],
  google: [
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  deepseek: [
    { value: 'deepseek-r1', label: 'DeepSeek R1' },
    { value: 'deepseek-v3', label: 'DeepSeek V3' },
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-coder', label: 'DeepSeek Coder' },
  ],
  qwen: [
    { value: 'qwen-max', label: 'Qwen Max' },
    { value: 'qwen-plus', label: 'Qwen Plus' },
    { value: 'qwen-turbo', label: 'Qwen Turbo' },
    { value: 'qwen-long', label: 'Qwen Long' },
    { value: 'qwen2.5-72b-instruct', label: 'Qwen 2.5 72B' },
    { value: 'qwen2.5-coder-32b', label: 'Qwen 2.5 Coder 32B' },
  ],
  mistral: [
    { value: 'mistral-large-latest', label: 'Mistral Large' },
    { value: 'mistral-medium-latest', label: 'Mistral Medium' },
    { value: 'mistral-small-latest', label: 'Mistral Small' },
    { value: 'codestral-latest', label: 'Codestral' },
    { value: 'pixtral-large-latest', label: 'Pixtral Large' },
    { value: 'ministral-8b-latest', label: 'Ministral 8B' },
  ],
  zhipu: [
    { value: 'glm-4-plus', label: 'GLM-4 Plus' },
    { value: 'glm-4', label: 'GLM-4' },
    { value: 'glm-4-flash', label: 'GLM-4 Flash' },
    { value: 'glm-4-long', label: 'GLM-4 Long' },
    { value: 'glm-4v-plus', label: 'GLM-4V Plus (Vision)' },
  ],
  moonshot: [
    { value: 'moonshot-v1-128k', label: 'Kimi 128K' },
    { value: 'moonshot-v1-32k', label: 'Kimi 32K' },
    { value: 'moonshot-v1-8k', label: 'Kimi 8K' },
  ],
  minimax: [
    { value: 'abab6.5s-chat', label: 'MiniMax abab 6.5s' },
    { value: 'abab6.5-chat', label: 'MiniMax abab 6.5' },
    { value: 'abab5.5-chat', label: 'MiniMax abab 5.5' },
  ],
  yi: [
    { value: 'yi-large', label: 'Yi Large' },
    { value: 'yi-medium', label: 'Yi Medium' },
    { value: 'yi-spark', label: 'Yi Spark' },
    { value: 'yi-large-turbo', label: 'Yi Large Turbo' },
  ],
  groq: [
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
  ],
  azure: [
    { value: 'gpt-4o', label: 'GPT-4o (Azure)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Azure)' },
    { value: 'gpt-4.1', label: 'GPT-4.1 (Azure)' },
  ],
  bedrock: [
    { value: 'anthropic.claude-3-5-sonnet-20241022-v2:0', label: 'Claude 3.5 Sonnet (Bedrock)' },
    { value: 'anthropic.claude-3-haiku-20240307-v1:0', label: 'Claude 3 Haiku (Bedrock)' },
    { value: 'amazon.nova-pro-v1:0', label: 'Amazon Nova Pro' },
    { value: 'amazon.nova-lite-v1:0', label: 'Amazon Nova Lite' },
    { value: 'meta.llama3-1-70b-instruct-v1:0', label: 'Llama 3.1 70B (Bedrock)' },
  ],
}

const PLATFORMS = [
  { value: 'nodejs', label: 'Node.js / TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'rest', label: 'REST API' },
]

function formatCost(cost: number): string {
  if (cost >= 1000) return `$${(cost / 1000).toFixed(1)}k`
  if (cost >= 1) return `$${cost.toFixed(2)}`
  if (cost > 0) return `$${cost.toFixed(4)}`
  return '$0.00'
}

function formatRequests(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`
  return count.toString()
}

function timeAgo(date: string | null): string {
  if (!date) return 'Never'
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function isActive(lastActivity: string | null): boolean {
  if (!lastActivity) return false
  return Date.now() - new Date(lastActivity).getTime() < 24 * 60 * 60 * 1000
}

export default function ProjectsPage() {
  const { projects, loadingProjects, fetchProjects, fetchUserPreferences } = useDashboardStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchUserPreferences().then(() => fetchProjects())
  }, [fetchUserPreferences, fetchProjects])

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--foreground-muted)]">
            Manage your projects and track SDK integrations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4   top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full h-12 pl-18 pr-4 text-sm leading-6"
          />
        </div>
      )}

      {/* Loading */}
      {loadingProjects && projects.length === 0 && (
        <div className="bento-card text-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground-muted)]">Loading projects...</p>
        </div>
      )}

      {/* Empty state */}
      {!loadingProjects && projects.length === 0 && (
        <div className="bento-card text-center py-16">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-[var(--foreground-muted)] mb-6 max-w-md mx-auto">
            Create your first project to start tracking AI costs. Install the SDK, wrap your LLM client, and telemetry flows automatically.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create your first project
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            fetchProjects()
          }}
        />
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const active = isActive(project.lastActivityAt)
  const platformLabel = PLATFORMS.find((p) => p.value === project.sdkPlatform)?.label || project.sdkPlatform

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="bento-card group hover:border-[var(--accent)]/50 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
          <FolderKanban className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`}
            title={active ? 'Active' : 'Inactive'}
          />
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] text-[var(--foreground-muted)]">
            {platformLabel}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-1 group-hover:text-[var(--accent)] transition-colors">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-sm text-[var(--foreground-muted)] mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Provider icons */}
      <div className="flex items-center gap-1.5 mb-4">
        {project.providers.map((provider) => (
          <div
            key={provider}
            title={provider}
          >
            <ProviderIcon provider={provider} size={28} colored shape="square" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 border-t border-[var(--border)]">
        <div>
          <p className="text-xs text-[var(--foreground-muted)]">Requests</p>
          <p className="font-semibold">{formatRequests(project.totalRequests)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--foreground-muted)]">Cost (30d)</p>
          <p className="font-semibold text-[var(--accent)]">{formatCost(project.totalCost30d)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--foreground-muted)]">Last Active</p>
          <p className="font-semibold">{timeAgo(project.lastActivityAt)}</p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-3 border-t border-[var(--border)]">
        <span className="text-sm text-[var(--accent)] flex items-center gap-1 group-hover:underline">
          View details <ExternalLink className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  )
}

function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [step, setStep] = useState<'form' | 'setup'>('form')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [sdkPlatform, setSdkPlatform] = useState('nodejs')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdProject, setCreatedProject] = useState<{
    projectKey: string
    setup: { installCommand: string; code: string }
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const availableModels = selectedProviders.flatMap(
    (p) => MODELS_BY_PROVIDER[p] || []
  )

  const toggleProvider = (provider: string) => {
    if (selectedProviders.includes(provider)) {
      setSelectedProviders((prev) => prev.filter((p) => p !== provider))
      // Remove models from that provider
      const providerModels = (MODELS_BY_PROVIDER[provider] || []).map((m) => m.value)
      setSelectedModels((prev) => prev.filter((m) => !providerModels.includes(m)))
    } else {
      setSelectedProviders((prev) => [...prev, provider])
    }
  }

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    if (selectedProviders.length === 0) {
      setError('Select at least one provider')
      return
    }
    if (selectedModels.length === 0) {
      setError('Select at least one model')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          providers: selectedProviders,
          models: selectedModels,
          sdkPlatform,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create project')
      }

      const data = await res.json()
      setCreatedProject({
        projectKey: data.project.projectKey,
        setup: data.setup,
      })
      setStep('setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyKey = () => {
    if (createdProject) {
      navigator.clipboard.writeText(createdProject.projectKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold">
            {step === 'form' ? 'Create New Project' : 'Project Created'}
          </h2>
          <button
            onClick={step === 'setup' ? onCreated : onClose}
            className="p-2 hover:bg-[var(--surface-elevated)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Project Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Customer Support Bot"
                className="input-field w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this project do?"
                rows={2}
                className="input-field w-full resize-none"
              />
            </div>

            {/* Providers */}
            <div>
              <label className="block text-sm font-medium mb-2">AI Providers *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => toggleProvider(p.value)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      selectedProviders.includes(p.value)
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                    }`}
                  >
                    <ProviderIcon provider={p.value} size={24} colored shape="square" />
                    <span className="text-sm font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Models */}
            {availableModels.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Models *</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableModels.map((m) => (
                    <label
                      key={m.value}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        selectedModels.includes(m.value)
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                          : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(m.value)}
                        onChange={() => toggleModel(m.value)}
                        className="accent-[var(--accent)]"
                      />
                      <span className="text-sm">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* SDK Platform */}
            <div>
              <label className="block text-sm font-medium mb-2">SDK Platform *</label>
              <div className="grid grid-cols-3 gap-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setSdkPlatform(p.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      sdkPlatform === p.value
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-[var(--error,#ef4444)]">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Setup instructions */
          <div className="p-6 space-y-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold">Project created successfully!</h3>
              <p className="text-[var(--foreground-muted)] text-sm mt-1">
                Follow these steps to start tracking your AI costs
              </p>
            </div>

            {/* Project Key */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Project Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-sm font-mono break-all">
                  {createdProject?.projectKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Install */}
            <div>
              <label className="block text-sm font-medium mb-2">1. Install the SDK</label>
              <div className="rounded-lg border border-[var(--border)] overflow-hidden">
                <CodeBlock
                  code={createdProject?.setup.installCommand || ''}
                  language="bash"
                />
              </div>
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium mb-2">2. Add to your code</label>
              <div className="rounded-lg border border-[var(--border)] overflow-hidden">
                <div className="px-3 py-2 border-b border-[var(--border)] flex items-center gap-2 text-xs" style={{ backgroundColor: '#252526', color: '#858585' }}>
                  <Terminal className="w-3.5 h-3.5" />
                  <span>setup.{sdkPlatform === 'python' ? 'py' : sdkPlatform === 'rest' ? 'http' : 'ts'}</span>
                </div>
                <CodeBlock
                  code={createdProject?.setup.code || ''}
                  language={sdkPlatform === 'python' ? 'python' : sdkPlatform === 'rest' ? 'bash' : 'javascript'}
                />
              </div>
            </div>

            {/* Done */}
            <button onClick={onCreated} className="btn-primary w-full">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
