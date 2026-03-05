'use client'

import React, { useMemo } from 'react'

type TokenType =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'function'
  | 'import-path'
  | 'type'
  | 'operator'
  | 'punctuation'
  | 'number'
  | 'variable'
  | 'plain'

interface Token {
  type: TokenType
  value: string
}

// VS Code Dark+ theme colors
const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: '#C586C0',       // purple-pink (import, from, const, export, etc.)
  string: '#CE9178',        // orange (string literals)
  comment: '#6A9955',       // green (comments)
  function: '#DCDCAA',      // yellow (function calls)
  'import-path': '#CE9178', // orange (module paths)
  type: '#4EC9B0',          // teal (types, class names)
  operator: '#D4D4D4',      // light gray (=, =>, etc.)
  punctuation: '#D4D4D4',   // light gray ({, }, (, ), etc.)  
  number: '#B5CEA8',        // light green (numbers)
  variable: '#9CDCFE',      // light blue (variables)
  plain: '#D4D4D4',         // default text
}

const JS_KEYWORDS = new Set([
  'import', 'from', 'export', 'const', 'let', 'var', 'function', 'return',
  'if', 'else', 'new', 'async', 'await', 'class', 'extends', 'default',
  'typeof', 'type', 'interface', 'declare', 'module',
])

const PYTHON_KEYWORDS = new Set([
  'import', 'from', 'def', 'class', 'return', 'if', 'else', 'elif',
  'for', 'while', 'with', 'as', 'try', 'except', 'finally', 'raise',
  'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'lambda',
])

function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = []
  const keywords = language === 'python' ? PYTHON_KEYWORDS : JS_KEYWORDS
  let i = 0

  while (i < line.length) {
    // Whitespace
    if (/\s/.test(line[i])) {
      let ws = ''
      while (i < line.length && /\s/.test(line[i])) {
        ws += line[i]
        i++
      }
      tokens.push({ type: 'plain', value: ws })
      continue
    }

    // Comments: // or #
    if (
      (line[i] === '/' && line[i + 1] === '/') ||
      (language === 'python' && line[i] === '#') ||
      (language === 'bash' && line[i] === '#')
    ) {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    // Strings: 'single', "double", `backtick`
    if (line[i] === "'" || line[i] === '"' || line[i] === '`') {
      const quote = line[i]
      let str = quote
      i++
      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\' && i + 1 < line.length) {
          str += line[i] + line[i + 1]
          i += 2
        } else {
          str += line[i]
          i++
        }
      }
      if (i < line.length) {
        str += line[i]
        i++
      }
      tokens.push({ type: 'string', value: str })
      continue
    }

    // Numbers
    if (/\d/.test(line[i])) {
      let num = ''
      while (i < line.length && /[\d.]/.test(line[i])) {
        num += line[i]
        i++
      }
      tokens.push({ type: 'number', value: num })
      continue
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$@]/.test(line[i])) {
      let word = ''
      // Allow @ for decorators and / for paths like @optim/sdk
      while (i < line.length && /[a-zA-Z0-9_$@/\-.]/.test(line[i])) {
        word += line[i]
        i++
      }

      if (keywords.has(word)) {
        tokens.push({ type: 'keyword', value: word })
      } else if (word[0] === '@' || word.includes('/')) {
        // Module path like @optim/sdk
        tokens.push({ type: 'string', value: word })
      } else if (/^[A-Z]/.test(word)) {
        // PascalCase = type/class name
        tokens.push({ type: 'type', value: word })
      } else if (i < line.length && line[i] === '(') {
        // Followed by ( = function call
        tokens.push({ type: 'function', value: word })
      } else {
        tokens.push({ type: 'variable', value: word })
      }
      continue
    }

    // Operators and punctuation
    if ('=>{}<>()[].,;:!&|+-*/?\\'.includes(line[i])) {
      // Multi-char operators
      if (line[i] === '=' && line[i + 1] === '>') {
        tokens.push({ type: 'operator', value: '=>' })
        i += 2
        continue
      }
      if (line[i] === '=' && line[i + 1] === '=') {
        tokens.push({ type: 'operator', value: line[i + 2] === '=' ? '===' : '==' })
        i += line[i + 2] === '=' ? 3 : 2
        continue
      }
      tokens.push({ type: 'punctuation', value: line[i] })
      i++
      continue
    }

    // Anything else
    tokens.push({ type: 'plain', value: line[i] })
    i++
  }

  return tokens
}

function detectLanguage(code: string): string {
  if (code.includes('curl ') || code.includes('curl\n')) return 'bash'
  if (code.includes('from ') && code.includes('import ') && !code.includes("from '")) return 'python'
  if (code.includes('pip install')) return 'python'
  return 'javascript'
}

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const lang = language || detectLanguage(code)

  const highlighted = useMemo(() => {
    const lines = code.split('\n')
    return lines.map((line, lineIdx) => {
      const tokens = tokenizeLine(line, lang)
      return (
        <div key={lineIdx} className="leading-6">
          {tokens.length === 0 ? (
            <span>{'\n'}</span>
          ) : (
            tokens.map((token, tokenIdx) => (
              <span
                key={tokenIdx}
                style={{ color: TOKEN_COLORS[token.type] }}
              >
                {token.value}
              </span>
            ))
          )}
        </div>
      )
    })
  }, [code, lang])

  return (
    <pre
      className={`p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap ${className || ''}`}
      style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4' }}
    >
      <code>{highlighted}</code>
    </pre>
  )
}
