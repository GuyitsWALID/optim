'use client'

import { useState } from 'react'

const steps = [
  {
    number: '01',
    title: 'Install the SDK',
    description: 'Add @optimai/sdk to your project. One package — works with any OpenAI-compatible provider out of the box.',
  },
  {
    number: '02',
    title: 'Wrap Your Client',
    description: 'Call wrapOpenAI() around your existing client. No code rewrites — your app keeps working exactly as before.',
  },
  {
    number: '03',
    title: 'See Your Costs',
    description: 'Every call is tracked automatically. Open your dashboard to see real-time spend by model, provider, and project.',
  },
  {
    number: '04',
    title: 'Optimize & Save',
    description: 'Get AI recommendations to swap models, enable smart routing, and set budget alerts. Cut costs by up to 85%.',
  },
]

const codeSnippets = {
  typescript: {
    label: 'TypeScript',
    code: [
      { type: 'comment', content: '// 1. Install' },
      { type: 'punctuation', content: '\n' },
      { type: 'keyword', content: '// ' },
      { type: 'string', content: 'npm install @optimai/sdk openai' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'comment', content: '// 2. Initialize & wrap — that\'s it' },
      { type: 'punctuation', content: '\n' },
      { type: 'keyword', content: 'import ' },
      { type: 'function', content: 'OpenAI ' },
      { type: 'keyword', content: 'from ' },
      { type: 'string', content: '"openai"' },
      { type: 'punctuation', content: '\n' },
      { type: 'keyword', content: 'import ' },
      { type: 'punctuation', content: '{ ' },
      { type: 'function', content: 'initOptim' },
      { type: 'punctuation', content: ', ' },
      { type: 'function', content: 'wrapOpenAI' },
      { type: 'punctuation', content: ' } ' },
      { type: 'keyword', content: 'from ' },
      { type: 'string', content: '"@optimai/sdk"' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'function', content: 'initOptim' },
      { type: 'punctuation', content: '({\n  ' },
      { type: 'string', content: 'projectKey' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"opt_proj_your_key"' },
      { type: 'punctuation', content: ',\n  ' },
      { type: 'string', content: 'baseUrl' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"https://optim.dev"' },
      { type: 'punctuation', content: '\n})\n\n' },
      { type: 'keyword', content: 'const ' },
      { type: 'function', content: 'openai ' },
      { type: 'operator', content: '= ' },
      { type: 'function', content: 'wrapOpenAI' },
      { type: 'punctuation', content: '(' },
      { type: 'keyword', content: 'new ' },
      { type: 'function', content: 'OpenAI' },
      { type: 'punctuation', content: '())\n\n' },
      { type: 'comment', content: '// Use OpenAI as normal — costs tracked automatically' },
      { type: 'punctuation', content: '\n' },
      { type: 'keyword', content: 'const ' },
      { type: 'function', content: 'res ' },
      { type: 'operator', content: '= ' },
      { type: 'keyword', content: 'await ' },
      { type: 'function', content: 'openai' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'chat' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'completions' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'create' },
      { type: 'punctuation', content: '({\n  ' },
      { type: 'string', content: 'model' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"gpt-4o"' },
      { type: 'punctuation', content: ',\n  ' },
      { type: 'string', content: 'messages' },
      { type: 'punctuation', content: ': [{ ' },
      { type: 'string', content: 'role' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"user"' },
      { type: 'punctuation', content: ', ' },
      { type: 'string', content: 'content' },
      { type: 'punctuation', content: ': ' },
      { type: 'string', content: '"Hello!"' },
      { type: 'punctuation', content: ' }]' },
      { type: 'punctuation', content: '\n})' },
    ],
  },
  python: {
    label: 'Python',
    code: [
      { type: 'comment', content: '# 1. Install' },
      { type: 'punctuation', content: '\n' },
      { type: 'keyword', content: '# ' },
      { type: 'string', content: 'pip install optimai-sdk openai' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'comment', content: '# 2. Initialize & wrap' },
      { type: 'punctuation', content: '\n' },
      { type: 'keyword', content: 'from ' },
      { type: 'function', content: 'optimai ' },
      { type: 'keyword', content: 'import ' },
      { type: 'function', content: 'init_optim, wrap_openai' },
      { type: 'punctuation', content: '\n' },
      { type: 'keyword', content: 'from ' },
      { type: 'function', content: 'openai ' },
      { type: 'keyword', content: 'import ' },
      { type: 'function', content: 'OpenAI' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'function', content: 'init_optim' },
      { type: 'punctuation', content: '(\n  ' },
      { type: 'string', content: 'project_key' },
      { type: 'operator', content: '=' },
      { type: 'string', content: '"opt_proj_your_key"' },
      { type: 'punctuation', content: ',\n  ' },
      { type: 'string', content: 'base_url' },
      { type: 'operator', content: '=' },
      { type: 'string', content: '"https://optim.dev"' },
      { type: 'punctuation', content: '\n)\n\n' },
      { type: 'function', content: 'client ' },
      { type: 'operator', content: '= ' },
      { type: 'function', content: 'wrap_openai' },
      { type: 'punctuation', content: '(' },
      { type: 'function', content: 'OpenAI' },
      { type: 'punctuation', content: '())\n\n' },
      { type: 'comment', content: '# Use as normal — costs tracked automatically' },
      { type: 'punctuation', content: '\n' },
      { type: 'function', content: 'res ' },
      { type: 'operator', content: '= ' },
      { type: 'function', content: 'client' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'chat' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'completions' },
      { type: 'punctuation', content: '.' },
      { type: 'function', content: 'create' },
      { type: 'punctuation', content: '(\n  ' },
      { type: 'string', content: 'model' },
      { type: 'operator', content: '=' },
      { type: 'string', content: '"gpt-4o"' },
      { type: 'punctuation', content: ',\n  ' },
      { type: 'string', content: 'messages' },
      { type: 'operator', content: '=' },
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
  rest: {
    label: 'REST API',
    code: [
      { type: 'comment', content: '# No SDK needed — send events directly via HTTP' },
      { type: 'punctuation', content: '\n\n' },
      { type: 'function', content: 'curl ' },
      { type: 'operator', content: '-X ' },
      { type: 'keyword', content: 'POST ' },
      { type: 'string', content: 'https://optim.dev/api/v1/ingest' },
      { type: 'punctuation', content: ' \\\n  ' },
      { type: 'operator', content: '-H ' },
      { type: 'string', content: '"Authorization: Bearer opt_proj_your_key"' },
      { type: 'punctuation', content: ' \\\n  ' },
      { type: 'operator', content: '-H ' },
      { type: 'string', content: '"Content-Type: application/json"' },
      { type: 'punctuation', content: ' \\\n  ' },
      { type: 'operator', content: '-d ' },
      { type: 'string', content: "'" },
      { type: 'punctuation', content: '{\n  ' },
      { type: 'string', content: '"events"' },
      { type: 'punctuation', content: ': [{\n    ' },
      { type: 'string', content: '"provider"' },
      { type: 'punctuation', content: ':     ' },
      { type: 'string', content: '"openai"' },
      { type: 'punctuation', content: ',\n    ' },
      { type: 'string', content: '"model"' },
      { type: 'punctuation', content: ':        ' },
      { type: 'string', content: '"gpt-4o"' },
      { type: 'punctuation', content: ',\n    ' },
      { type: 'string', content: '"promptTokens"' },
      { type: 'punctuation', content: ': ' },
      { type: 'function', content: '150' },
      { type: 'punctuation', content: ',\n    ' },
      { type: 'string', content: '"completionTokens"' },
      { type: 'punctuation', content: ': ' },
      { type: 'function', content: '80' },
      { type: 'punctuation', content: ',\n    ' },
      { type: 'string', content: '"latencyMs"' },
      { type: 'punctuation', content: ':     ' },
      { type: 'function', content: '320' },
      { type: 'punctuation', content: '\n  }]\n}' },
      { type: 'string', content: "'" },
    ],
  },
}

const languageColors: Record<string, string> = {
  typescript: '#3178C6',
  python: '#3776AB',
  rest: '#10B981',
}

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<keyof typeof codeSnippets>('typescript')

  return (
    <section id="how-it-works" className="py-16 sm:py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
            Start saving in under 2 minutes
          </h2>
          <p className="text-base sm:text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            No infrastructure changes. No proxy setup. Just wrap your existing client and watch the savings roll in.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-[var(--border)]" />
              )}

              <div className="bento-card h-full">
                {/* Number */}
                <div className="text-5xl sm:text-6xl font-display font-bold text-[var(--accent)]/20 mb-3 sm:mb-4">
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-heading font-semibold mb-2 sm:mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Code snippet with tabs */}
        <div className="mt-12 sm:mt-16">
          <div className="bento-card max-w-4xl mx-auto overflow-hidden px-0 py-0">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-3 sm:px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-elevated)] overflow-x-auto">
              {(Object.keys(codeSnippets) as Array<keyof typeof codeSnippets>).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
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
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-x-auto bg-[var(--surface)]">
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
