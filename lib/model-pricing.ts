// Model pricing data - prices are per 1 million tokens
// Updated: March 2026

export interface ModelPricing {
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'ollama' | 'groq' | 'deepseek' | 'qwen' | 'mistral' | 'zhipu' | 'moonshot' | 'minimax' | 'yi' | 'bedrock' | 'other'
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
    name: 'gpt-4.1',
    provider: 'openai',
    displayName: 'GPT-4.1',
    inputPrice: 2.00,
    outputPrice: 8.00,
    contextWindow: 1000000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gpt-4.1-mini',
    provider: 'openai',
    displayName: 'GPT-4.1 Mini',
    inputPrice: 0.40,
    outputPrice: 1.60,
    contextWindow: 1000000,
    capabilityTier: 'medium',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gpt-4.1-nano',
    provider: 'openai',
    displayName: 'GPT-4.1 Nano',
    inputPrice: 0.10,
    outputPrice: 0.40,
    contextWindow: 1000000,
    capabilityTier: 'low',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
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
    name: 'o3',
    provider: 'openai',
    displayName: 'o3',
    inputPrice: 10.00,
    outputPrice: 40.00,
    contextWindow: 200000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'o3-mini',
    provider: 'openai',
    displayName: 'o3 Mini',
    inputPrice: 1.10,
    outputPrice: 4.40,
    contextWindow: 200000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'o1',
    provider: 'openai',
    displayName: 'o1',
    inputPrice: 15.00,
    outputPrice: 60.00,
    contextWindow: 200000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'o1-mini',
    provider: 'openai',
    displayName: 'o1 Mini',
    inputPrice: 3.00,
    outputPrice: 12.00,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },

  // ============ Anthropic ============
  {
    name: 'claude-opus-4-20250514',
    provider: 'anthropic',
    displayName: 'Claude Opus 4',
    inputPrice: 15.00,
    outputPrice: 75.00,
    contextWindow: 200000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
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

  // ============ Google ============
  {
    name: 'gemini-2.5-pro',
    provider: 'google',
    displayName: 'Gemini 2.5 Pro',
    inputPrice: 1.25,
    outputPrice: 10.00,
    contextWindow: 1000000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gemini-2.5-flash',
    provider: 'google',
    displayName: 'Gemini 2.5 Flash',
    inputPrice: 0.15,
    outputPrice: 0.60,
    contextWindow: 1000000,
    capabilityTier: 'medium',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gemini-2.0-flash',
    provider: 'google',
    displayName: 'Gemini 2.0 Flash',
    inputPrice: 0.10,
    outputPrice: 0.40,
    contextWindow: 1000000,
    capabilityTier: 'medium',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'gemini-2.0-flash-lite',
    provider: 'google',
    displayName: 'Gemini 2.0 Flash Lite',
    inputPrice: 0.075,
    outputPrice: 0.30,
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

  // ============ DeepSeek ============
  {
    name: 'deepseek-r1',
    provider: 'deepseek',
    displayName: 'DeepSeek R1',
    inputPrice: 0.55,
    outputPrice: 2.19,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'deepseek-v3',
    provider: 'deepseek',
    displayName: 'DeepSeek V3',
    inputPrice: 0.27,
    outputPrice: 1.10,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'deepseek-chat',
    provider: 'deepseek',
    displayName: 'DeepSeek Chat',
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: 128000,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'deepseek-coder',
    provider: 'deepseek',
    displayName: 'DeepSeek Coder',
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: 128000,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },

  // ============ Qwen (Alibaba) ============
  {
    name: 'qwen-max',
    provider: 'qwen',
    displayName: 'Qwen Max',
    inputPrice: 1.60,
    outputPrice: 6.40,
    contextWindow: 32000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'qwen-plus',
    provider: 'qwen',
    displayName: 'Qwen Plus',
    inputPrice: 0.80,
    outputPrice: 2.00,
    contextWindow: 131072,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'qwen-turbo',
    provider: 'qwen',
    displayName: 'Qwen Turbo',
    inputPrice: 0.30,
    outputPrice: 0.60,
    contextWindow: 131072,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'qwen-long',
    provider: 'qwen',
    displayName: 'Qwen Long',
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: 10000000,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'qwen2.5-72b-instruct',
    provider: 'qwen',
    displayName: 'Qwen 2.5 72B',
    inputPrice: 0.90,
    outputPrice: 0.90,
    contextWindow: 131072,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'qwen2.5-coder-32b',
    provider: 'qwen',
    displayName: 'Qwen 2.5 Coder 32B',
    inputPrice: 0.60,
    outputPrice: 0.60,
    contextWindow: 131072,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },

  // ============ Mistral AI ============
  {
    name: 'mistral-large-latest',
    provider: 'mistral',
    displayName: 'Mistral Large',
    inputPrice: 2.00,
    outputPrice: 6.00,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'mistral-medium-latest',
    provider: 'mistral',
    displayName: 'Mistral Medium',
    inputPrice: 0.80,
    outputPrice: 2.40,
    contextWindow: 128000,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'mistral-small-latest',
    provider: 'mistral',
    displayName: 'Mistral Small',
    inputPrice: 0.20,
    outputPrice: 0.60,
    contextWindow: 128000,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'codestral-latest',
    provider: 'mistral',
    displayName: 'Codestral',
    inputPrice: 0.30,
    outputPrice: 0.90,
    contextWindow: 256000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'pixtral-large-latest',
    provider: 'mistral',
    displayName: 'Pixtral Large',
    inputPrice: 2.00,
    outputPrice: 6.00,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    name: 'ministral-8b-latest',
    provider: 'mistral',
    displayName: 'Ministral 8B',
    inputPrice: 0.10,
    outputPrice: 0.10,
    contextWindow: 128000,
    capabilityTier: 'low',
    supportsFunctionCalling: true,
  },

  // ============ Zhipu (GLM) ============
  {
    name: 'glm-4-plus',
    provider: 'zhipu',
    displayName: 'GLM-4 Plus',
    inputPrice: 1.40,
    outputPrice: 1.40,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'glm-4',
    provider: 'zhipu',
    displayName: 'GLM-4',
    inputPrice: 0.70,
    outputPrice: 0.70,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'glm-4-flash',
    provider: 'zhipu',
    displayName: 'GLM-4 Flash',
    inputPrice: 0.01,
    outputPrice: 0.01,
    contextWindow: 128000,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'glm-4-long',
    provider: 'zhipu',
    displayName: 'GLM-4 Long',
    inputPrice: 0.14,
    outputPrice: 0.14,
    contextWindow: 1000000,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'glm-4v-plus',
    provider: 'zhipu',
    displayName: 'GLM-4V Plus',
    inputPrice: 1.40,
    outputPrice: 1.40,
    contextWindow: 8192,
    capabilityTier: 'high',
    supportsVision: true,
    supportsFunctionCalling: true,
  },

  // ============ Moonshot (Kimi) ============
  {
    name: 'moonshot-v1-128k',
    provider: 'moonshot',
    displayName: 'Kimi 128K',
    inputPrice: 0.84,
    outputPrice: 0.84,
    contextWindow: 128000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'moonshot-v1-32k',
    provider: 'moonshot',
    displayName: 'Kimi 32K',
    inputPrice: 0.34,
    outputPrice: 0.34,
    contextWindow: 32000,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'moonshot-v1-8k',
    provider: 'moonshot',
    displayName: 'Kimi 8K',
    inputPrice: 0.17,
    outputPrice: 0.17,
    contextWindow: 8192,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },

  // ============ MiniMax ============
  {
    name: 'abab6.5s-chat',
    provider: 'minimax',
    displayName: 'MiniMax abab 6.5s',
    inputPrice: 0.14,
    outputPrice: 0.14,
    contextWindow: 245760,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'abab6.5-chat',
    provider: 'minimax',
    displayName: 'MiniMax abab 6.5',
    inputPrice: 0.42,
    outputPrice: 0.42,
    contextWindow: 8192,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'abab5.5-chat',
    provider: 'minimax',
    displayName: 'MiniMax abab 5.5',
    inputPrice: 0.21,
    outputPrice: 0.21,
    contextWindow: 6144,
    capabilityTier: 'low',
  },

  // ============ 01.AI (Yi) ============
  {
    name: 'yi-large',
    provider: 'yi',
    displayName: 'Yi Large',
    inputPrice: 2.50,
    outputPrice: 2.50,
    contextWindow: 32000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },
  {
    name: 'yi-medium',
    provider: 'yi',
    displayName: 'Yi Medium',
    inputPrice: 0.36,
    outputPrice: 0.36,
    contextWindow: 16000,
    capabilityTier: 'medium',
    supportsFunctionCalling: true,
  },
  {
    name: 'yi-spark',
    provider: 'yi',
    displayName: 'Yi Spark',
    inputPrice: 0.14,
    outputPrice: 0.14,
    contextWindow: 16000,
    capabilityTier: 'low',
    supportsFunctionCalling: true,
  },
  {
    name: 'yi-large-turbo',
    provider: 'yi',
    displayName: 'Yi Large Turbo',
    inputPrice: 1.70,
    outputPrice: 1.70,
    contextWindow: 16000,
    capabilityTier: 'high',
    supportsFunctionCalling: true,
  },

  // ============ Groq ============
  {
    name: 'llama-3.3-70b-versatile',
    provider: 'groq',
    displayName: 'Llama 3.3 70B Versatile',
    inputPrice: 0.59,
    outputPrice: 0.79,
    contextWindow: 128000,
    capabilityTier: 'high',
  },
  {
    name: 'llama-3.1-8b-instant',
    provider: 'groq',
    displayName: 'Llama 3.1 8B Instant',
    inputPrice: 0.05,
    outputPrice: 0.08,
    contextWindow: 128000,
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
    name: 'azure-gpt-4.1',
    provider: 'azure',
    displayName: 'Azure GPT-4.1',
    inputPrice: 2.00,
    outputPrice: 8.00,
    contextWindow: 1000000,
    capabilityTier: 'high',
    supportsVision: true,
  },

  // ============ AWS Bedrock ============
  {
    name: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    provider: 'bedrock',
    displayName: 'Claude 3.5 Sonnet (Bedrock)',
    inputPrice: 3.00,
    outputPrice: 15.00,
    contextWindow: 200000,
    capabilityTier: 'high',
    supportsVision: true,
  },
  {
    name: 'anthropic.claude-3-haiku-20240307-v1:0',
    provider: 'bedrock',
    displayName: 'Claude 3 Haiku (Bedrock)',
    inputPrice: 0.25,
    outputPrice: 1.25,
    contextWindow: 200000,
    capabilityTier: 'low',
  },
  {
    name: 'amazon.nova-pro-v1:0',
    provider: 'bedrock',
    displayName: 'Amazon Nova Pro',
    inputPrice: 0.80,
    outputPrice: 3.20,
    contextWindow: 300000,
    capabilityTier: 'high',
    supportsVision: true,
  },
  {
    name: 'amazon.nova-lite-v1:0',
    provider: 'bedrock',
    displayName: 'Amazon Nova Lite',
    inputPrice: 0.06,
    outputPrice: 0.24,
    contextWindow: 300000,
    capabilityTier: 'medium',
    supportsVision: true,
  },
  {
    name: 'meta.llama3-1-70b-instruct-v1:0',
    provider: 'bedrock',
    displayName: 'Llama 3.1 70B (Bedrock)',
    inputPrice: 0.72,
    outputPrice: 0.72,
    contextWindow: 128000,
    capabilityTier: 'high',
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
