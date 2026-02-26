'use client'

import { useState } from 'react'

const steps = [
  {
    number: '01',
    title: 'Connect Your API Keys',
    description: 'Add your OpenAI, Anthropic, or other provider keys in seconds. We support 50+ providers.',
  },
  {
    number: '02',
    title: 'Track in Real-time',
    description: 'Install our SDK or use our proxy. Every call is logged with full cost visibility.',
  },
  {
    number: '03',
    title: 'Get AI Recommendations',
    description: 'Our AI analyzes your usage patterns and suggests specific optimizations.',
  },
  {
    number: '04',
    title: 'Save Up to 85%',
    description: 'Apply recommendations with one click or let auto-routing handle it for you.',
  },
]

const codeSnippets = {
  python: {
    label: 'Python',
    code: [
      { type: 'comment', content: '# Install the SDK' },
      { type: 'keyword', content: 'pip install ' },
      { type: 'string', content: 'optim-sdk' },
      { type: 'comment', content: '\n# Track your AI costs' },
      { type: 'keyword', content: 'from ' },
      { type: 'function', content: 'optim ' },
      { type: 'keyword', content: 'import ' },
      { type: 'function', content: 'Optim' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'function', content: 'optim ' },
      { type: 'operator', content: '=' },
      { type: 'function', content: 'Optim' },
      { type: 'punctuation', content: '(' },
      { type: 'string', content: 'api_key=' },
      { type: 'string', content: '"opt_xxx"' },
      { type: 'punctuation', content: ')\n' },
      { type: 'function', content: 'client ' },
      { type: 'operator', content: '=' },
      { type: 'function', content: 'optim' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'openai' },
      { type: 'punctuation', content: '()' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'comment', content: '# Your AI calls are now tracked' },
      { type: 'function', content: 'response ' },
      { type: 'operator', content: '=' },
      { type: 'function', content: 'client' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'chat' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'completions' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'create' },
      { type: 'punctuation', content: '(\n    ' },
      { type: 'string', content: 'model' },
      { type: 'punctuation', content: '=' },
      { type: 'string', content: '"gpt-4"' },
      { type: 'punctuation', content: ',\n    ' },
      { type: 'string', content: 'messages' },
      { type: 'punctuation', content: '=' },
      { type: 'punctuation', content: '[{' },
      { type: 'string', content: '"role"' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"user"' },
      { type: 'punctuation', content: ', ' },
      { type: 'string', content: '"content"' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"Hello!"' },
      { type: 'punctuation', content: '}]' },
      { type: 'punctuation', content: '\n)' },
    ],
  },
  typescript: {
    label: 'TypeScript',
    code: [
      { type: 'comment', content: '// Install the SDK' },
      { type: 'keyword', content: 'npm install ' },
      { type: 'string', content: 'optim-sdk' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'comment', content: '// Track your AI costs' },
      { type: 'keyword', content: 'import ' },
      { type: 'function', content: 'Optim ' },
      { type: 'keyword', content: 'from ' },
      { type: 'string', content: '"optim-sdk"' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'keyword', content: 'const ' },
      { type: 'function', content: 'optim ' },
      { type: 'operator', content: '=' },
      { type: 'keyword', content: 'new ' },
      { type: 'function', content: 'Optim' },
      { type: 'punctuation', content: '({' },
      { type: 'string', content: 'apiKey' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"opt_xxx"' },
      { type: 'punctuation', content: '})' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'keyword', content: 'const ' },
      { type: 'function', content: 'response ' },
      { type: 'operator', content: '=' },
      { type: 'keyword', content: 'await ' },
      { type: 'function', content: 'optim' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'chat' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'completions' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'create' },
      { type: 'punctuation', content: '({\n    ' },
      { type: 'string', content: 'model' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"gpt-4"' },
      { type: 'punctuation', content: ',\n    ' },
      { type: 'string', content: 'messages' },
      { type: 'punctuation', content: ': [' },
      { type: 'punctuation', content: '{\n      ' },
      { type: 'string', content: 'role' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"user"' },
      { type: 'punctuation', content: ',\n      ' },
      { type: 'string', content: 'content' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"Hello!"' },
      { type: 'punctuation', content: '\n    }' },
      { type: 'punctuation', content: ']\n' },
      { type: 'punctuation', content: '})' },
    ],
  },
  nodejs: {
    label: 'Node.js',
    code: [
      { type: 'comment', content: '// Install the SDK' },
      { type: 'keyword', content: 'npm install ' },
      { type: 'string', content: 'optim-sdk' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'comment', content: '// Track your AI costs' },
      { type: 'keyword', content: 'const ' },
      { type: 'function', content: 'Optim ' },
      { type: 'operator', content: '=' },
      { type: 'function', content: 'require' },
      { type: 'punctuation', content: '(' },
      { type: 'string', content: '"optim-sdk"' },
      { type: 'punctuation', content: ')' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'keyword', content: 'const ' },
      { type: 'function', content: 'optim ' },
      { type: 'operator', content: '=' },
      { type: 'keyword', content: 'new ' },
      { type: 'function', content: 'Optim' },
      { type: 'punctuation', content: '({' },
      { type: 'string', content: 'apiKey' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"opt_xxx"' },
      { type: 'punctuation', content: '})' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'keyword', content: 'async function ' },
      { type: 'function', content: 'main' },
      { type: 'punctuation', content: '() ' },
      { type: 'operator', content: '{' },
      { type: 'punctuation', content: '\n    ' },
      { type: 'keyword', content: 'const ' },
      { type: 'function', content: 'response ' },
      { type: 'operator', content: '=' },
      { type: 'keyword', content: 'await ' },
      { type: 'function', content: 'optim' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'chat' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'completions' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'create' },
      { type: 'punctuation', content: '({\n      ' },
      { type: 'string', content: 'model' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"gpt-4"' },
      { type: 'punctuation', content: ',\n      ' },
      { type: 'string', content: 'messages' },
      { type: 'punctuation', content: ': [' },
      { type: 'punctuation', content: '{\n        ' },
      { type: 'string', content: 'role' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"user"' },
      { type: 'punctuation', content: ',\n        ' },
      { type: 'string', content: 'content' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"Hello!"' },
      { type: 'punctuation', content: '\n      }' },
      { type: 'punctuation', content: ']\n    ' },
      { type: 'punctuation', content: '})\n' },
      { type: 'punctuation', content: '}' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'function', content: 'main' },
      { type: 'punctuation', content: '()' },
    ],
  },
}

const languageColors: Record<string, string> = {
  python: '#3776AB',
  typescript: '#3178C6',
  nodejs: '#339933',
}

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<keyof typeof codeSnippets>('python')

  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Start saving in minutes
          </h2>
          <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Four simple steps to dramatically reduce your AI costs.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-[var(--border)]" />
              )}

              <div className="bento-card h-full">
                {/* Number - constructivist style */}
                <div className="text-6xl font-display font-bold text-[var(--accent)]/20 mb-4">
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="text-xl font-heading font-semibold mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[var(--foreground-secondary)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Code snippet with tabs */}
        <div className="mt-16">
          <div className="bento-card max-w-4xl mx-auto overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
              {(Object.keys(codeSnippets) as Array<keyof typeof codeSnippets>).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === lang
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                      : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: languageColors[lang] }}
                    />
                    {codeSnippets[lang].label}
                  </span>
                </button>
              ))}
            </div>

            {/* Code content */}
            <div className="p-6 font-mono text-sm overflow-x-auto bg-[var(--surface)]">
              <pre>
                {codeSnippets[activeTab].code.map((token, index) => (
                  <span
                    key={index}
                    className={
                      token.type === 'comment'
                        ? 'text-[var(--foreground-muted)]'
                        : token.type === 'keyword'
                        ? 'text-purple-500 dark:text-purple-400'
                        : token.type === 'string'
                        ? 'text-green-600 dark:text-green-400'
                        : token.type === 'function'
                        ? 'text-blue-600 dark:text-blue-400'
                        : token.type === 'operator'
                        ? 'text-[var(--foreground-secondary)]'
                        : token.type === 'punctuation'
                        ? 'text-[var(--foreground-muted)]'
                        : ''
                    }
                  >
                    {token.content}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
