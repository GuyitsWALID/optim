"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapOpenAI = wrapOpenAI;
const client_1 = require("./client");
/**
 * Wraps an OpenAI client to automatically track all chat completion requests.
 *
 * Usage:
 * ```ts
 * import OpenAI from 'openai'
 * import { initOptim, wrapOpenAI } from '@optim/sdk'
 *
 * initOptim({ projectKey: 'opt_proj_...' })
 * const openai = wrapOpenAI(new OpenAI())
 *
 * // Use normally — telemetry is sent automatically
 * const res = await openai.chat.completions.create({ model: 'gpt-4o', messages: [...] })
 * ```
 */
function wrapOpenAI(client) {
    (0, client_1.getConfig)(); // ensure initialized
    const originalCreate = client.chat.completions.create.bind(client.chat.completions);
    client.chat.completions.create = async function wrappedCreate(...args) {
        const params = args[0] || {};
        const model = params.model || 'unknown';
        const isStreaming = params.stream === true;
        const start = Date.now();
        try {
            const result = await originalCreate(...args);
            // Handle streaming responses
            if (isStreaming && result && typeof result[Symbol.asyncIterator] === 'function') {
                return wrapStream(result, model, start);
            }
            // Handle non-streaming responses
            const latencyMs = Date.now() - start;
            const usage = result?.usage;
            if (usage) {
                (0, client_1.enqueueEvent)({
                    provider: 'openai',
                    model,
                    promptTokens: usage.prompt_tokens ?? 0,
                    completionTokens: usage.completion_tokens ?? 0,
                    totalTokens: usage.total_tokens ?? (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
                    latencyMs,
                    isStreaming: false,
                    status: 'success',
                });
            }
            return result;
        }
        catch (err) {
            const latencyMs = Date.now() - start;
            (0, client_1.enqueueEvent)({
                provider: 'openai',
                model,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                latencyMs,
                isStreaming,
                status: 'error',
            });
            throw err;
        }
    };
    return client;
}
/**
 * Wraps a streaming response to extract usage info from the final chunk.
 */
function wrapStream(stream, model, startTime) {
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;
    const originalIterator = stream[Symbol.asyncIterator].bind(stream);
    const wrappedStream = {
        ...stream,
        [Symbol.asyncIterator]() {
            const iterator = originalIterator();
            return {
                async next() {
                    const result = await iterator.next();
                    if (result.done) {
                        // Stream ended - send telemetry
                        const latencyMs = Date.now() - startTime;
                        (0, client_1.enqueueEvent)({
                            provider: 'openai',
                            model,
                            promptTokens,
                            completionTokens,
                            totalTokens: totalTokens || promptTokens + completionTokens,
                            latencyMs,
                            isStreaming: true,
                            status: 'success',
                        });
                        return result;
                    }
                    // Check for usage in chunk (OpenAI includes usage in final chunk when stream_options.include_usage is set)
                    const chunk = result.value;
                    if (chunk?.usage) {
                        promptTokens = chunk.usage.prompt_tokens ?? promptTokens;
                        completionTokens = chunk.usage.completion_tokens ?? completionTokens;
                        totalTokens = chunk.usage.total_tokens ?? totalTokens;
                    }
                    return result;
                },
                async return(...args) {
                    return iterator.return?.(...args) ?? { done: true, value: undefined };
                },
                async throw(...args) {
                    return iterator.throw?.(...args);
                },
            };
        },
    };
    return wrappedStream;
}
//# sourceMappingURL=wrap-openai.js.map