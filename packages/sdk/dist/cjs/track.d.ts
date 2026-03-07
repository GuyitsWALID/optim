export interface TrackRequestParams {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens?: number;
    latencyMs?: number;
    isStreaming?: boolean;
    originalModel?: string;
    status?: string;
    feature?: string;
    metadata?: Record<string, string>;
}
/**
 * Manually track an LLM request. Use this when not using wrapOpenAI.
 */
export declare function trackRequest(params: TrackRequestParams): void;
//# sourceMappingURL=track.d.ts.map