import { prisma } from './prisma'
import { type ModelProvider, modelPricing, type ModelPricing } from './model-pricing'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/models'

// Only sync models from these major providers
const PROVIDER_MAP: Record<string, ModelProvider> = {
  'openai': 'openai',
  'anthropic': 'anthropic',
  'google': 'google',
  'deepseek': 'deepseek',
  'qwen': 'qwen',
  'mistralai': 'mistral',
  'meta-llama': 'meta',
  'x-ai': 'xai',
  'cohere': 'cohere',
  'perplexity': 'perplexity',
  'amazon': 'amazon',
}

// Tier classification based on pricing
function classifyTier(inputPrice: number, _outputPrice: number): 'low' | 'medium' | 'high' {
  if (inputPrice >= 2) return 'high'
  if (inputPrice >= 0.5) return 'medium'
  return 'low'
}

interface OpenRouterModel {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length: number
  architecture?: {
    modality?: string
    input_modalities?: string[]
    output_modalities?: string[]
  }
  description?: string
}

interface OpenRouterResponse {
  data: OpenRouterModel[]
}

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const res = await fetch(OPENROUTER_API_URL, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`)
  }

  const json: OpenRouterResponse = await res.json()
  return json.data
}

function mapOpenRouterModel(model: OpenRouterModel): {
  name: string
  provider: string
  displayName: string
  inputPrice: number
  outputPrice: number
  contextWindow: number
  supportsVision: boolean
  supportsFunctionCalling: boolean
  capabilityTier: string
  openRouterId: string
  description: string | null
  inputModalities: string | null
  outputModalities: string | null
} {
  const providerSlug = model.id.split('/')[0]
  const provider = PROVIDER_MAP[providerSlug] || providerSlug

  // OpenRouter prices are per-token, convert to per-million-tokens
  const inputPrice = parseFloat(model.pricing.prompt) * 1_000_000
  const outputPrice = parseFloat(model.pricing.completion) * 1_000_000

  const inputMods = model.architecture?.input_modalities || []
  const outputMods = model.architecture?.output_modalities || []

  return {
    name: model.id.split('/').slice(1).join('/'),
    provider,
    displayName: model.name,
    inputPrice: Math.round(inputPrice * 100) / 100,
    outputPrice: Math.round(outputPrice * 100) / 100,
    contextWindow: model.context_length,
    supportsVision: inputMods.includes('image'),
    supportsFunctionCalling: true, // Most modern models support this
    capabilityTier: classifyTier(inputPrice, outputPrice),
    openRouterId: model.id,
    description: model.description || null,
    inputModalities: inputMods.length > 0 ? inputMods.join(',') : null,
    outputModalities: outputMods.length > 0 ? outputMods.join(',') : null,
  }
}

export async function syncModelsToDb(): Promise<{ synced: number; errors: number }> {
  const models = await fetchOpenRouterModels()

  // Filter to supported providers only
  const supportedModels = models.filter((m) => {
    const providerSlug = m.id.split('/')[0]
    return PROVIDER_MAP[providerSlug] !== undefined
  })

  let synced = 0
  let errors = 0

  for (const model of supportedModels) {
    try {
      const mapped = mapOpenRouterModel(model)

      await prisma.model.upsert({
        where: { openRouterId: model.id },
        update: {
          displayName: mapped.displayName,
          inputPrice: mapped.inputPrice,
          outputPrice: mapped.outputPrice,
          contextWindow: mapped.contextWindow,
          supportsVision: mapped.supportsVision,
          supportsFunctionCalling: mapped.supportsFunctionCalling,
          capabilityTier: mapped.capabilityTier,
          description: mapped.description,
          inputModalities: mapped.inputModalities,
          outputModalities: mapped.outputModalities,
          lastSyncedAt: new Date(),
          isActive: true,
        },
        create: {
          name: mapped.name,
          provider: mapped.provider,
          displayName: mapped.displayName,
          inputPrice: mapped.inputPrice,
          outputPrice: mapped.outputPrice,
          contextWindow: mapped.contextWindow,
          supportsVision: mapped.supportsVision,
          supportsFunctionCalling: mapped.supportsFunctionCalling,
          capabilityTier: mapped.capabilityTier,
          openRouterId: model.id,
          description: mapped.description,
          inputModalities: mapped.inputModalities,
          outputModalities: mapped.outputModalities,
          lastSyncedAt: new Date(),
          isActive: true,
        },
      })

      synced++
    } catch {
      errors++
    }
  }

  return { synced, errors }
}

/** Get models from DB, falling back to static data if DB is empty or stale */
export async function getModels(options?: {
  provider?: string
  tier?: string
  search?: string
}): Promise<ModelPricing[]> {
  try {
    // Try DB first
    const dbModels = await prisma.model.findMany({
      where: {
        isActive: true,
        ...(options?.provider && { provider: options.provider }),
        ...(options?.tier && { capabilityTier: options.tier }),
        ...(options?.search && {
          OR: [
            { displayName: { contains: options.search, mode: 'insensitive' as const } },
            { name: { contains: options.search, mode: 'insensitive' as const } },
            { provider: { contains: options.search, mode: 'insensitive' as const } },
          ],
        }),
      },
      orderBy: { provider: 'asc' },
    })

    if (dbModels.length > 0) {
      // Check staleness — if last sync was more than 24h ago, sync in background
      const lastSync = dbModels[0]?.lastSyncedAt
      if (lastSync && Date.now() - lastSync.getTime() > 24 * 60 * 60 * 1000) {
        // Fire-and-forget background sync
        syncModelsToDb().catch(() => {})
      }

      return dbModels.map((m) => ({
        name: m.name,
        provider: m.provider as ModelProvider,
        displayName: m.displayName || m.name,
        inputPrice: m.inputPrice,
        outputPrice: m.outputPrice,
        contextWindow: m.contextWindow || 128000,
        supportsVision: m.supportsVision,
        supportsFunctionCalling: m.supportsFunctionCalling,
        capabilityTier: (m.capabilityTier as ModelPricing['capabilityTier']) || 'medium',
      }))
    }
  } catch {
    // DB unavailable, fall through to static data
  }

  // Fallback to static data
  let result = [...modelPricing]

  if (options?.provider) {
    result = result.filter((m) => m.provider === options.provider)
  }
  if (options?.tier) {
    result = result.filter((m) => m.capabilityTier === options.tier)
  }
  if (options?.search) {
    const q = options.search.toLowerCase()
    result = result.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
    )
  }

  return result
}
