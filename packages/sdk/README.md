# @optimai/sdk

Track and optimize your AI costs automatically. Wrap any OpenAI-compatible client and telemetry flows to Optim with zero code changes.

Automatically detects providers: **OpenAI, Groq, Anthropic, Mistral, DeepSeek, Together, Fireworks, Perplexity, Cohere, OpenRouter**.

## Installation

```bash
npm install @optimai/sdk openai
```

## Quick Start (OpenAI)

```typescript
import OpenAI from 'openai'
import { initOptim, wrapOpenAI } from '@optimai/sdk'

initOptim({ projectKey: 'opt_proj_your_key_here' })

const openai = wrapOpenAI(new OpenAI())

const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
})
```

## Using with Groq

Groq uses an OpenAI-compatible API, so just point the OpenAI client at Groq:

```typescript
import OpenAI from 'openai'
import { initOptim, wrapOpenAI } from '@optimai/sdk'

initOptim({ projectKey: 'opt_proj_your_key_here' })

const groq = wrapOpenAI(new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
}))

// Use as normal — provider is auto-detected as "groq"
const res = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: 'Hello!' }],
})
```

## Using with Other Providers

Any OpenAI-compatible provider works the same way:

```typescript
// Together AI
const together = wrapOpenAI(new OpenAI({
  baseURL: 'https://api.together.xyz/v1',
  apiKey: process.env.TOGETHER_API_KEY,
}))

// Mistral
const mistral = wrapOpenAI(new OpenAI({
  baseURL: 'https://api.mistral.ai/v1',
  apiKey: process.env.MISTRAL_API_KEY,
}))
```

## Manual Tracking

For providers without an OpenAI-compatible API, use `trackRequest` directly:

```typescript
import { initOptim, trackRequest } from '@optimai/sdk'

initOptim({ projectKey: 'opt_proj_your_key_here' })

trackRequest({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  promptTokens: 150,
  completionTokens: 300,
  latencyMs: 1200,
})
```

## Configuration

```typescript
initOptim({
  projectKey: 'opt_proj_...',    // Required
  baseUrl: 'https://optim.dev',  // API endpoint (default)
  batchSize: 10,                  // Events per batch (default: 10)
  flushInterval: 5000,            // Flush interval in ms (default: 5000)
  debug: true,                    // Enable debug logging to see SDK activity
})
```

## Streaming Support

Streaming is fully supported. The SDK automatically injects `stream_options.include_usage: true` so token counts are captured:

```typescript
const stream = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
})

for await (const chunk of stream) {
  // process chunks...
}
// Telemetry is sent automatically when the stream ends
```

## Graceful Shutdown

Call `flushAll()` before your process exits to ensure all events are sent:

```typescript
import { flushAll } from '@optimai/sdk'

process.on('beforeExit', async () => {
  await flushAll()
})
```
