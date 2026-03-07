import { enqueueEvent, getConfig } from './client';
/**
 * Manually track an LLM request. Use this when not using wrapOpenAI.
 */
export function trackRequest(params) {
    getConfig(); // ensure initialized
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
    });
}
//# sourceMappingURL=track.js.map