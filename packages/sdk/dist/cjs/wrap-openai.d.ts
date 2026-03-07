/**
 * Wraps an OpenAI-compatible client to automatically track all chat completion requests.
 * Works with any provider that uses the OpenAI SDK format: Groq, Together, Fireworks, etc.
 */
export declare function wrapOpenAI<T extends {
    chat: {
        completions: {
            create: Function;
        };
    };
}>(client: T): T;
//# sourceMappingURL=wrap-openai.d.ts.map