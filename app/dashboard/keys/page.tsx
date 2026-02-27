'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy, Check, Key, RefreshCw, Shield, Clock, Activity } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

const providers = [
  { value: 'openai', label: 'OpenAI', icon: '🤖' },
  { value: 'anthropic', label: 'Anthropic', icon: '🧠' },
  { value: 'google', label: 'Google', icon: '🔷' },
  { value: 'azure', label: 'Azure OpenAI', icon: '☁️' },
  { value: 'groq', label: 'Groq', icon: '⚡' },
  { value: 'ollama', label: 'Ollama', icon: '🦙' },
]

export default function KeysPage() {
  const { apiKeys, loadingKeys, addApiKey, deleteApiKey, fetchApiKeys } = useDashboardStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newProvider, setNewProvider] = useState('openai')
  const [newName, setNewName] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleAddKey = async () => {
    if (!newKey.trim()) {
      setError('API key is required')
      return
    }

    setError('')
    await addApiKey(newKey, newProvider, newName || undefined)
    setNewKey('')
    setNewName('')
    setIsAdding(false)
  }

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getProviderIcon = (provider: string) => {
    return providers.find(p => p.value === provider)?.icon || '🔑'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--foreground-muted)]">Manage your API keys for different providers</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add API Key
        </button>
      </div>

      {/* Add Key Form */}
      {isAdding && (
        <div className="bento-card">
          <h3 className="font-semibold text-lg mb-4">Add New API Key</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Provider</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {providers.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setNewProvider(p.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      newProvider === p.value
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{p.icon}</span>
                    <span className="text-sm font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-..."
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Name (optional)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Production, Development, etc."
                className="input-field w-full"
              />
            </div>

            {error && <p className="text-sm text-[var(--error)]">{error}</p>}

            <div className="flex gap-3">
              <button onClick={handleAddKey} className="btn-primary">
                Save Key
              </button>
              <button onClick={() => setIsAdding(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      {loadingKeys ? (
        <div className="bento-card text-center py-16">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 text-[var(--foreground-muted)] animate-spin" />
          <p>Loading API keys...</p>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="bento-card text-center py-16">
          <Key className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
          <h3 className="text-lg font-medium mb-2">No API keys yet</h3>
          <p className="text-[var(--foreground-muted)] mb-4">
            Add your first API key to start tracking costs
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="bento-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-2xl">
                    {getProviderIcon(key.provider)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{key.name || 'Unnamed Key'}</h3>
                    <p className="text-sm text-[var(--foreground-muted)] capitalize">{key.provider}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-6 text-sm text-[var(--foreground-muted)]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span>{key._count.requests} requests</span>
                    </div>
                    {key.lastUsedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(key.lastUsedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(key.id)}
                      className="p-2 hover:bg-[var(--surface-secondary)] rounded-lg transition-colors"
                      title="Copy Key ID"
                    >
                      {copied === key.id ? (
                        <Check className="w-5 h-5 text-[var(--success)]" />
                      ) : (
                        <Copy className="w-5 h-5 text-[var(--foreground-muted)]" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="p-2 hover:bg-[var(--surface-secondary)] rounded-lg transition-colors text-[var(--error)]"
                      title="Delete key"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="bento-card bg-[var(--accent)]/5 border-[var(--accent)]/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Your API keys are secure</h4>
            <p className="text-sm text-[var(--foreground-muted)]">
              We encrypt your API keys at rest and never share them with third parties.
              Keys are only used to proxy requests to the respective AI providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
