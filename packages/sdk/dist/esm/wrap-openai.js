import { enqueueEvent, getConfig } from './client';
const PROVIDER_PATTERNS = {
    'api.groq.com': 'groq',
    'api.anthropic.com': 'anthropic',
    'generativelanguage.googleapis.com': 'google',
    'api.mistral.ai': 'mistral',
    'api.deepseek.com': 'deepseek',
    'api.together.xyz': 'together',
    'api.fireworks.ai': 'fireworks',
    'api.perplexity.ai': 'perplexity',
    'api.cohere.ai': 'cohere',
    'openrouter.ai': 'openrouter',
    'api.openai.com': 'openai',
};
function detectProvider(client) {
    try {
        const baseURL = client?.baseURL ?? client?._options?.baseURL ?? '';
        for (const [host, provider] of Object.entries(PROVIDER_PATTERNS)) {
            if (baseURL.includes(host))
                return provider;
        }
    }
    catch { /* ignore */ }
    return 'openai';
}
/**
 * Wraps an OpenAI-compatible client to automatically track all chat completion requests.
 * Works with any provider that uses the OpenAI SDK format: Groq, Together, Fireworks, etc.
 */
export function wrapOpenAI(client) {
    getConfig(); // ensure initialized
    const provider = detectProvider(client);
    const originalCreate = client.chat.completions.create.bind(client.chat.completions);
    client.chat.completions.create = async function wrappedCreate(...args) {
        const params = args[0] || {};
        const model = params.model || 'unknown';
        const isStreaming = params.stream === true;
        const start = Date.now();
        // Auto-inject stream_options.include_usage for streaming so we get token counts
        if (isStreaming && !params.stream_options?.include_usage) {
            args[0] = {
                ...params,
                stream_options: { ...params.stream_options, include_usage: true },
            };
        }
        try {
            const result = await originalCreate(...args);
            // Handle streaming responses
            if (isStreaming && result && typeof result[Symbol.asyncIterator] === 'function') {
                return wrapStream(result, model, provider, start);
            }
            // Handle non-streaming responses
            const latencyMs = Date.now() - start;
            const usage = result?.usage;
            enqueueEvent({
                provider,
                model,
                promptTokens: usage?.prompt_tokens ?? 0,
                completionTokens: usage?.completion_tokens ?? 0,
                totalTokens: usage?.total_tokens ?? (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0),
                latencyMs,
                isStreaming: false,
                status: 'success',
            });
            return result;
        }
        catch (err) {
            const latencyMs = Date.now() - start;
            enqueueEvent({
                provider,
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
function wrapStream(stream, model, provider, startTime) {
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
                        enqueueEvent({
                            provider,
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