'use client'

import { useState } from 'react'
import { User, Bell, Shield, Palette, Key, Globe, Save, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'api', label: 'API Keys', icon: Key },
  ]

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bento-card">
              <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">W</span>
                  </div>
                  <div>
                    <button className="btn-secondary text-sm">Change Avatar</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input type="text" defaultValue="Walid" className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input type="text" defaultValue="" className="input-field w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" defaultValue="walid@example.com" className="input-field w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input type="text" placeholder="Your company name" className="input-field w-full" />
                </div>

                <button className="btn-primary flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bento-card">
              <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                {[
                  { id: 'budget', label: 'Budget Alerts', desc: 'Get notified when approaching budget limits' },
                  { id: 'usage', label: 'Usage Reports', desc: 'Weekly summary of API usage and costs' },
                  { id: 'recommendations', label: 'New Recommendations', desc: 'When AI recommendations are available' },
                  { id: 'anomalies', label: 'Anomaly Detection', desc: 'Alerts for unusual spending patterns' },
                  { id: 'security', label: 'Security Alerts', desc: 'Suspicious API key activity' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                    </label>
                  </div>
                ))}

                <button className="btn-primary flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bento-card">
              <h2 className="text-xl font-bold mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Change Password</h3>
                  <div className="space-y-3 max-w-md">
                    <input type="password" placeholder="Current password" className="input-field w-full" />
                    <input type="password" placeholder="New password" className="input-field w-full" />
                    <input type="password" placeholder="Confirm new password" className="input-field w-full" />
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)]">
                  <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-[var(--foreground-muted)] mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <button className="btn-secondary">Enable 2FA</button>
                </div>

                <div className="pt-6 border-t border-[var(--border)]">
                  <h3 className="font-medium mb-2 text-[var(--error)]">Danger Zone</h3>
                  <p className="text-sm text-[var(--foreground-muted)] mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <button className="px-4 py-2 border border-[var(--error)] text-[var(--error)] rounded-lg hover:bg-[var(--error)]/10 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bento-card">
              <h2 className="text-xl font-bold mb-6">Appearance</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['Light', 'Dark', 'System'].map((theme) => (
                      <button
                        key={theme}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'System'
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                            : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                        }`}
                      >
                        <div className={`w-full h-16 rounded-lg mb-2 ${
                          theme === 'Light' ? 'bg-white border' :
                          theme === 'Dark' ? 'bg-gray-900' :
                          'bg-gradient-to-r from-white to-gray-900'
                        }`} />
                        <span className="text-sm font-medium">{theme}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Accent Color</h3>
                  <div className="flex gap-3">
                    {['#40A83E', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'].map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                          color === '#40A83E' ? 'ring-2 ring-offset-2 ring-[var(--accent)]' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bento-card">
              <h2 className="text-xl font-bold mb-6">API Access</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">API Keys</h3>
                  <p className="text-sm text-[var(--foreground-muted)] mb-4">
                    Manage API keys for programmatic access
                  </p>
                  <button className="btn-primary">Generate New API Key</button>
                </div>

                <div className="pt-6 border-t border-[var(--border)]">
                  <h3 className="font-medium mb-2">Webhooks</h3>
                  <p className="text-sm text-[var(--foreground-muted)] mb-4">
                    Configure webhooks for real-time notifications
                  </p>
                  <button className="btn-secondary">Add Webhook</button>
                </div>

                <div className="pt-6 border-t border-[var(--border)]">
                  <h3 className="font-medium mb-2">Rate Limits</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-[var(--surface-secondary)] rounded-lg">
                      <p className="text-2xl font-bold">1,000</p>
                      <p className="text-sm text-[var(--foreground-muted)]">Requests/min</p>
                    </div>
                    <div className="p-4 bg-[var(--surface-secondary)] rounded-lg">
                      <p className="text-2xl font-bold">$10,000</p>
                      <p className="text-sm text-[var(--foreground-muted)]">Monthly limit</p>
                    </div>
                    <div className="p-4 bg-[var(--surface-secondary)] rounded-lg">
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-sm text-[var(--foreground-muted)]">Active keys</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
