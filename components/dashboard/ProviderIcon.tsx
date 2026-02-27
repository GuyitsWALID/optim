'use client'

import React from 'react'
import { OpenAI, Anthropic, Gemini, AzureAI , DeepSeek, Qwen, Groq, Ollama, Grok } from '@lobehub/icons'

interface ProviderIconProps {
  provider: string
  size?: number
  className?: string
}

export function ProviderIcon({ provider, size = 24, className }: ProviderIconProps) {
  const normalizedProvider = provider.toLowerCase()

  const iconMap: Record<string, React.ReactNode> = {
    openai: <OpenAI size={size} className={className} />,
    anthropic: <Anthropic size={size} className={className} />,
    gemini: <Gemini size={size} className={className} />,
    deepseek: <DeepSeek size={size} className={className} />,
    qwen: <Qwen size={size} className={className} />,
    groq: <Groq size={size} className={className} />,
    ollama: <Ollama size={size} className={className} />,
    azure: <AzureAI size={size} className={className} />,
    grok: <Grok size={size} className={className} />,
  }

  return iconMap[normalizedProvider] || <OpenAI size={size} className={className} />
}

interface ProviderLogoProps {
  provider: string
  className?: string
}

export function ProviderLogo({ provider, className }: ProviderLogoProps) {
  const normalizedProvider = provider.toLowerCase()

  const logoMap: Record<string, React.ReactNode> = {
    openai: <OpenAI.Avatar size={48} className={className} />,
    anthropic: <Anthropic.Avatar size={48} className={className} />,
    gemini: <Gemini.Avatar size={48} className={className} />,
    deepseek: <DeepSeek.Avatar size={48} className={className} />,
    qwen: <Qwen.Avatar size={48} className={className} />,
    groq: <Groq.Avatar size={48} className={className} />,
    ollama: <Ollama.Avatar size={48} className={className} />,
    azure: <AzureAI.Avatar size={48} className={className} />,
    grok: <Grok.Avatar size={48} className={className} />,  
  }

  return logoMap[normalizedProvider] || <OpenAI size={48} className={className} />
}
