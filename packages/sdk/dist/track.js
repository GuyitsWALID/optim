"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackRequest = trackRequest;
const client_1 = require("./client");
/**
 * Manually track an LLM request. Use this when not using wrapOpenAI.
 */
function trackRequest(params) {
    (0, client_1.getConfig)(); // ensure initialized
    (0, client_1.enqueueEvent)({
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