# @optim/sdk

Track and optimize your AI costs automatically. Wrap your OpenAI client and telemetry flows to Optim with zero code changes.

## Installation

```bash
npm install @optim/sdk
```

## Quick Start

```typescript
import OpenAI from 'openai'
import { initOptim, wrapOpenAI } from '@optim/sdk'

// Initialize with your project key
initOptim({
  projectKey: 'opt_proj_your_key_here',
})

// Wrap your OpenAI client
const openai = wrapOpenAI(new OpenAI())

// Use normally — telemetry is automatic
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
})
```

## Manual Tracking

For non-OpenAI providers, use `trackRequest` directly:

```typescript
import { initOptim, trackRequest } from '@optim/sdk'

initOptim({ projectKey: 'opt_proj_your_key_here' })

// After making an API call to any provider
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
  debug: false,                   // Enable debug logging
})
```

## Streaming Support

Streaming is automatically supported. For best results, enable `stream_options.include_usage`:

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
  stream_options: { include_usage: true },
})

for await (const chunk of stream) {
  // process chunks...
}
// Telemetry is sent automatically when the stream ends
```
