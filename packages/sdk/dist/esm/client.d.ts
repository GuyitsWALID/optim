export interface OptimConfig {
    /** Project key (starts with opt_proj_) */
    projectKey: string;
    /** Optim API base URL — required, e.g. 'https://optim.dev' */
    baseUrl: string;
    /** Batch size before flushing (default: 10) */
    batchSize?: number;
    /** Max time in ms between flushes (default: 5000) */
    flushInterval?: number;
    /** Enable debug logging (default: false) */
    debug?: boolean;
}
interface OptimEvent {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs?: number;
    isStreaming?: boolean;
    originalModel?: string;
    status?: string;
    feature?: string;
    metadata?: Record<string, string>;
}
export declare function initOptim(config: OptimConfig): void;
export declare function getConfig(): OptimConfig;
export declare function enqueueEvent(event: OptimEvent): void;
/**
 * Force flush all pending events. Call before process exit.
 */
export declare function flushAll(): Promise<void>;
export {};
//# sourceMappingURL=client.d.ts.map