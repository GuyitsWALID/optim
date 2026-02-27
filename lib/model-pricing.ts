// Model pricing data - prices are per 1 million tokens
// Updated: February 2026

export interface ModelPricing {
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'ollama' | 'groq' | 'other'
  displayName: string
  inputPrice: number // per 1M tokens
  outputPrice: number // per 1M tokens
  contextWindow: number
  capabilityTier: 'low' | 'medium' | 'high'
  supportsVision?: boolean
  supportsFunctionCalling?: boolean
}

export const modelPricing: ModelPricing[] = [
  // ============ OpenAI ============
  {
    name: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    inputPrice: 2.50,
    outputPrice: 10.00,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'GPT-4o Mini',
    inputPrice: 0.15,
    outputPrice: 0.60,
    contextWindow: 128000,
    capabilityTier: 'medium',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gpt-4-turbo',
    provider: 'openai',
    displayName: 'GPT-4 Turbo',
    inputPrice: 10.00,
    outputPrice: 30.00,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gpt-4',
    provider: 'openai',
    displayName: 'GPT-4',
    inputPrice: 30.00,
    outputPrice: 60.00,
    contextWindow: 8192,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'gpt-3.5-turbo',
    provider: 'openai',
    displayName: 'GPT-3.5 Turbo',
    inputPrice: 0.50,
    outputPrice: 1.50,
    contextWindow: 16385,
    capabilityTier: 'low',
    supportsFunctionCalling: true,
  },

  // ============ Anthropic ============
  {
    name: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    displayName: 'Claude Sonnet 4',
    inputPrice: 3.00,
    outputPrice: 15.00,
    contextWindow: 200000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Sonnet',
    inputPrice: 3.00,
    outputPrice: 15.00,
    contextWindow: 200000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Haiku',
    inputPrice: 0.80,
    outputPrice: 4.00,
    contextWindow: 200000,
    capabilityTier: 'medium',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'claude-3-opus-20240229',
    provider: 'anthropic',
    displayName: 'Claude 3 Opus',
    inputPrice: 15.00,
    outputPrice: 75.00,
    contextWindow: 200000,
    capabilityTier: 'high',
    supportsVision: true,
  },
  {
    name: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    displayName: 'Claude 3 Haiku',
    inputPrice: 0.25,
    outputPrice: 1.25,
    contextWindow: 200000,
    capabilityTier: 'low',
    supportsVision: true,
  },

  // ============ Google ============
  {
    name: 'gemini-2.0-flash-exp',
    provider: 'google',
    displayName: 'Gemini 2.0 Flash Experimental',
    inputPrice: 0.00,
    outputPrice: 0.00,
    contextWindow: 1000000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gemini-1.5-flash',
    provider: 'google',
    displayName: 'Gemini 1.5 Flash',
    inputPrice: 0.075,
    outputPrice: 0.30,
    contextWindow: 1000000,
    capabilityTier: 'medium',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gemini-1.5-flash-8b',
    provider: 'google',
    displayName: 'Gemini 1.5 Flash 8B',
    inputPrice: 0.04,
    outputPrice: 0.14,
    contextWindow: 1000000,
    capabilityTier: 'low',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gemini-1.5-pro',
    provider: 'google',
    displayName: 'Gemini 1.5 Pro',
    inputPrice: 1.25,
    outputPrice: 5.00,
    contextWindow: 2000000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },

  // ============ Groq ============
  {
    name: 'llama-3.3-70b-versatile',
    provider: 'groq',
    displayName: 'Llama 3.3 70B Versatile',
    inputPrice: 0.59,
    outputPrice: 0.79,
    contextWindow: 8192,
    capabilityTier: 'high',
  },
  {
    name: 'llama-3.1-70b-versatile',
    provider: 'groq',
    displayName: 'Llama 3.1 70B Versatile',
    inputPrice: 0.59,
    outputPrice: 0.79,
    contextWindow: 8192,
    capabilityTier: 'high',
  },
  {
    name: 'llama-3.1-8b-instant',
    provider: 'groq',
    displayName: 'Llama 3.1 8B Instant',
    inputPrice: 0.05,
    outputPrice: 0.08,
    contextWindow: 8192,
    capabilityTier: 'low',
  },
  {
    name: 'mixtral-8x7b-32768',
    provider: 'groq',
    displayName: 'Mixtral 8x7B',
    inputPrice: 0.24,
    outputPrice: 0.24,
    contextWindow: 32768,
    capabilityTier: 'medium',
  },
  {
    name: 'gemma2-9b-it',
    provider: 'groq',
    displayName: 'Gemma 2 9B',
    inputPrice: 0.20,
    outputPrice: 0.20,
    contextWindow: 8192,
    capabilityTier: 'low',
  },

  // ============ Ollama (local) ============
  {
    name: 'llama3.1',
    provider: 'ollama',
    displayName: 'Llama 3.1',
    inputPrice: 0.00, // Local - no API cost
    outputPrice: 0.00,
    contextWindow: 128000,
    capabilityTier: 'medium',
  },
  {
    name: 'mistral',
    provider: 'ollama',
    displayName: 'Mistral',
    inputPrice: 0.00,
    outputPrice: 0.00,
    contextWindow: 8192,
    capabilityTier: 'medium',
  },
  {
    name: 'codellama',
    provider: 'ollama',
    displayName: 'CodeLlama',
    inputPrice: 0.00,
    outputPrice: 0.00,
    contextWindow: 16384,
    capabilityTier: 'medium',
  },

  // ============ Azure OpenAI ============
  {
    name: 'azure-gpt-4o',
    provider: 'azure',
    displayName: 'Azure GPT-4o',
    inputPrice: 2.50,
    outputPrice: 10.00,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsVision: true,
  },
  {
    name: 'azure-gpt-4o-mini',
    provider: 'azure',
    displayName: 'Azure GPT-4o Mini',
    inputPrice: 0.15,
    outputPrice: 0.60,
    contextWindow: 128000,
    capabilityTier: 'medium',
  },
  {
    name: 'azure-gpt-35-turbo',
    provider: 'azure',
    displayName: 'Azure GPT-3.5 Turbo',
    inputPrice: 0.50,
    outputPrice: 1.50,
    contextWindow: 16385,
    capabilityTier: 'low',
  },
]

// Helper to get pricing by model name
export function getModelPricing(modelName: string): ModelPricing | undefined {
  return modelPricing.find(m => m.name.toLowerCase() === modelName.toLowerCase())
}

// Helper to calculate cost
export function calculateCost(
  modelName: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = getModelPricing(modelName)
  if (!pricing) return 0

  const promptCost = (promptTokens / 1_000_000) * pricing.inputPrice
  const completionCost = (completionTokens / 1_000_000) * pricing.outputPrice

  return promptCost + completionCost
}

// Get models by provider
export function getModelsByProvider(provider: string): ModelPricing[] {
  return modelPricing.filter(m => m.provider === provider)
}

// Get models by capability tier
export function getModelsByTier(tier: 'low' | 'medium' | 'high'): ModelPricing[] {
  return modelPricing.filter(m => m.capabilityTier === tier)
}

// Get cheaper alternatives for a model
export function getCheaperAlternatives(modelName: string): ModelPricing[] {
  const current = getModelPricing(modelName)
  if (!current) return []

  // Find models with lower or equal capability tier
  const tierOrder = { low: 0, medium: 1, high: 2 }
  const currentTier = tierOrder[current.capabilityTier]

  return modelPricing
    .filter(m =>
      m.name !== current.name &&
      tierOrder[m.capabilityTier] <= currentTier
    )
    .sort((a, b) => (a.inputPrice + a.outputPrice) - (b.inputPrice + b.outputPrice))
    .slice(0, 3)
}
