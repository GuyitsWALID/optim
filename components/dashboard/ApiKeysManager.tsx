'use client'

import { useState } from 'react'
import { Plus, Trash2, Key, Copy, Check } from 'lucide-react'
import { useDashboardStore, ApiKey } from '@/lib/store'

const providers = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'groq', label: 'Groq' },
  { value: 'ollama', label: 'Ollama' },
]

export function ApiKeysManager() {
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

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold">API Keys</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Key
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-[var(--surface-secondary)] rounded-lg space-y-3">
          <div>
            <label className="block text-sm text-[var(--foreground-muted)] mb-1">API Key</label>
            <input
              type="password"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="sk-..."
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--foreground-muted)] mb-1">Provider</label>
            <select
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              className="input-field w-full"
            >
              {providers.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--foreground-muted)] mb-1">Name (optional)</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Production, Development, etc."
              className="input-field w-full"
            />
          </div>
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleAddKey} className="btn-primary text-sm">
              Save Key
            </button>
            <button onClick={() => setIsAdding(false)} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loadingKeys ? (
        <div className="text-center py-8 text-[var(--foreground-muted)]">Loading...</div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-8 text-[var(--foreground-muted)]">
          <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No API keys yet</p>
          <p className="text-sm">Add your first API key to start tracking</p>
        </div>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-3 bg-[var(--surface-secondary)] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <Key className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="font-medium">{key.name || 'Unnamed Key'}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {key.provider} • {key._count.requests} requests
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {key.lastUsedAt && (
                  <span className="text-xs text-[var(--foreground-muted)]">
                    Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={() => handleCopy(key.id)}
                  className="p-2 hover:bg-[var(--surface)] rounded-lg transition-colors"
                  title="Copy ID"
                >
                  {copied === key.id ? (
                    <Check className="w-4 h-4 text-[var(--success)]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteApiKey(key.id)}
                  className="p-2 hover:bg-[var(--surface)] rounded-lg transition-colors text-[var(--error)]"
                  title="Delete key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
