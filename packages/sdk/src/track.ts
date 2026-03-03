import { enqueueEvent, getConfig } from './client'

export interface TrackRequestParams {
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens?: number
  latencyMs?: number
  isStreaming?: boolean
  originalModel?: string
  status?: string
  feature?: string
  metadata?: Record<string, string>
}

/**
 * Manually track an LLM request. Use this when not using wrapOpenAI.
 */
export function trackRequest(params: TrackRequestParams): void {
  getConfig() // ensure initialized

  enqueueEvent({
    provider: params.provider,
    model: params.model,
    promptTokens: params.promptTokens,
    completionTokens: params.completionTokens,
    totalTokens: params.totalTokens ?? params.promptTokens + params.completionTokens,
    latencyMs: params.latencyMs,
    isStreaming: params.isStreaming,
    originalModel: params.originalModel,
    status: params.status ?? 'success',
    feature: params.feature,
    metadata: params.metadata,
  })
}
