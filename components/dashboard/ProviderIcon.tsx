'use client'

import React from 'react'
import {
  OpenAI, Anthropic, Gemini, AzureAI, DeepSeek, Qwen, Groq, Ollama, Grok,
  Mistral, Zhipu, Moonshot, Minimax, Yi, Bedrock, Meta, Cohere, Perplexity,
} from '@lobehub/icons'

// xAI doesn't have a dedicated icon in lobehub, reuse Grok
const XAI = Grok

interface ProviderIconProps {
  provider: string
  size?: number
  className?: string
  /** Use colored Avatar variant instead of monochrome icon */
  colored?: boolean
  /** Shape of the avatar (only used when colored=true) */
  shape?: 'circle' | 'square'
}

export function ProviderIcon({ provider, size = 24, className, colored, shape = 'circle' }: ProviderIconProps) {
  const normalizedProvider = provider.toLowerCase()

  if (colored) {
    const avatarMap: Record<string, React.ReactNode> = {
      openai: <OpenAI.Avatar size={size} shape={shape} className={className} />,
      anthropic: <Anthropic.Avatar size={size} shape={shape} className={className} />,
      gemini: <Gemini.Avatar size={size} shape={shape} className={className} />,
      google: <Gemini.Avatar size={size} shape={shape} className={className} />,
      deepseek: <DeepSeek.Avatar size={size} shape={shape} className={className} />,
      qwen: <Qwen.Avatar size={size} shape={shape} className={className} />,
      mistral: <Mistral.Avatar size={size} shape={shape} className={className} />,
      zhipu: <Zhipu.Avatar size={size} shape={shape} className={className} />,
      moonshot: <Moonshot.Avatar size={size} shape={shape} className={className} />,
      minimax: <Minimax.Avatar size={size} shape={shape} className={className} />,
      yi: <Yi.Avatar size={size} shape={shape} className={className} />,
      groq: <Groq.Avatar size={size} shape={shape} className={className} />,
      ollama: <Ollama.Avatar size={size} shape={shape} className={className} />,
      azure: <AzureAI.Avatar size={size} shape={shape} className={className} />,
      bedrock: <Bedrock.Avatar size={size} shape={shape} className={className} />,
      grok: <Grok.Avatar size={size} shape={shape} className={className} />,
      meta: <Meta.Avatar size={size} shape={shape} className={className} />,
      xai: <XAI.Avatar size={size} shape={shape} className={className} />,
      cohere: <Cohere.Avatar size={size} shape={shape} className={className} />,
      perplexity: <Perplexity.Avatar size={size} shape={shape} className={className} />,
    }
    return avatarMap[normalizedProvider] || <OpenAI.Avatar size={size} shape={shape} className={className} />
  }

  const iconMap: Record<string, React.ReactNode> = {
    openai: <OpenAI size={size} className={className} />,
    anthropic: <Anthropic size={size} className={className} />,
    gemini: <Gemini size={size} className={className} />,
    google: <Gemini size={size} className={className} />,
    deepseek: <DeepSeek size={size} className={className} />,
    qwen: <Qwen size={size} className={className} />,
    mistral: <Mistral size={size} className={className} />,
    zhipu: <Zhipu size={size} className={className} />,
    moonshot: <Moonshot size={size} className={className} />,
    minimax: <Minimax size={size} className={className} />,
    yi: <Yi size={size} className={className} />,
    groq: <Groq size={size} className={className} />,
    ollama: <Ollama size={size} className={className} />,
    azure: <AzureAI size={size} className={className} />,
    bedrock: <Bedrock size={size} className={className} />,
    grok: <Grok size={size} className={className} />,
    meta: <Meta size={size} className={className} />,
    xai: <XAI size={size} className={className} />,
    cohere: <Cohere size={size} className={className} />,
    perplexity: <Perplexity size={size} className={className} />,
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
    mistral: <Mistral.Avatar size={48} className={className} />,
    zhipu: <Zhipu.Avatar size={48} className={className} />,
    moonshot: <Moonshot.Avatar size={48} className={className} />,
    minimax: <Minimax.Avatar size={48} className={className} />,
    yi: <Yi.Avatar size={48} className={className} />,
    groq: <Groq.Avatar size={48} className={className} />,
    ollama: <Ollama.Avatar size={48} className={className} />,
    azure: <AzureAI.Avatar size={48} className={className} />,
    bedrock: <Bedrock.Avatar size={48} className={className} />,
    grok: <Grok.Avatar size={48} className={className} />,
    meta: <Meta.Avatar size={48} className={className} />,
    xai: <XAI.Avatar size={48} className={className} />,
    cohere: <Cohere.Avatar size={48} className={className} />,
    perplexity: <Perplexity.Avatar size={48} className={className} />,
  }

  return logoMap[normalizedProvider] || <OpenAI size={48} className={className} />
}
