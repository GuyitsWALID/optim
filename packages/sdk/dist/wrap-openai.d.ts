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
export declare function wrapOpenAI<T extends {
    chat: {
        completions: {
            create: Function;
        };
    };
}>(client: T): T;
//# sourceMappingURL=wrap-openai.d.ts.map