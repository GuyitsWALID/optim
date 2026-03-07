# Optim - AI Cost Optimization SDK & Dashboard

## Vision

Optim is a **lightweight SDK + cloud dashboard** for tracking, analyzing, and optimizing AI/LLM costs. Users install the SDK in their project — it wraps their existing LLM client, measures usage, and reports telemetry to the Optim dashboard. **No API keys are stored. No proxy. No vendor lock-in.**

Inspired by Vercel Analytics: install, wrap, deploy — costs tracked automatically.

---

## How It Works

```
User's Project                              Optim Cloud
┌──────────────────────────┐               ┌───────────────────────┐
│                          │   telemetry   │                       │
│  import { wrapOpenAI }   │──────────────>│  Ingest API           │
│  from '@optimai/sdk'       │   (batched    │  ┌─────────────────┐  │
│                          │    POST)      │  │ Cost Analytics   │  │
│  const ai = wrapOpenAI(  │               │  │ Recommendations  │  │
│    new OpenAI({          │  config poll  │  │ Auto-Optimize    │  │
│      apiKey: USER_KEY    │<──────────────│  │ Dashboard        │  │
│    }),                   │  (30s cache)  │  └─────────────────┘  │
│    { projectKey: '...' } │               │                       │
│  )                       │               └───────────────────────┘
│                          │
│  // Use normally          │
│  ai.chat.completions     │
│    .create({ model, ... })│
└──────────────────────────┘

What the SDK sends:     model, tokens, latency, cost, status, tags
What it NEVER sends:    API keys, prompt content, response content
```

---

## Core Differentiators

| Feature | Competitors (LiteLLM, Langfuse, Helicone) | Optim |
|---------|-------------------------------------------|-------|
| Integration model | Proxy / baseURL swap / framework-specific | **SDK wrapper — 2 lines of code** |
| API key handling | Transit through proxy or stored | **Never touches user keys** |
| Auto-optimization | None | **Client-side model routing** |
| AI recommendations | None | **Groq-powered per-project insights** |
| Multi-project tracking | Basic | **Project comparison & cross-project analytics** |
| SDK platforms | Usually JS-only or Python-only | **Node.js + Python + REST API** |

---

## SDK Platforms

### 1. Node.js / TypeScript — `@optimai/sdk`

```typescript
import { initOptim, wrapOpenAI } from '@optimai/sdk'
import OpenAI from 'openai'

initOptim({ projectKey: 'opt_proj_...' })

const openai = wrapOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))

// Works exactly like normal — telemetry is automatic
const res = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
})
```

### 2. Python — `optim-sdk`

```python
from optim_sdk import init_optim, wrap_openai
from openai import OpenAI

init_optim(project_key="opt_proj_...")

client = wrap_openai(OpenAI())

res = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
```

### 3. REST API — Language-Agnostic

Any language sends telemetry directly via HTTP POST:

```bash
curl -X POST https://app.optim.dev/api/v1/ingest \
  -H "Authorization: Bearer opt_proj_..." \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "provider": "openai",
      "model": "gpt-4o",
      "promptTokens": 150,
      "completionTokens": 50,
      "latencyMs": 820,
      "status": "success",
      "tags": { "feature": "chat" }
    }]
  }'
```

---

## Supported LLM Providers

| Provider | Node.js Wrapper | Python Wrapper | REST API | Difficulty |
|----------|----------------|----------------|----------|------------|
| **OpenAI** | `wrapOpenAI()` | `wrap_openai()` | Manual | Easy — `response.usage` has tokens |
| **Anthropic** | `wrapAnthropic()` | `wrap_anthropic()` | Manual | Easy — `response.usage` has tokens |
| **Google Gemini** | `wrapGoogleAI()` | `wrap_google_ai()` | Manual | Medium — wrap `generateContent()` + `sendMessage()` |
| **Groq** | `wrapGroq()` | `wrap_groq()` | Manual | Easy — OpenAI-compatible API |
| **Azure OpenAI** | `wrapOpenAI()` | `wrap_openai()` | Manual | Easy — extends OpenAI SDK |
| **AWS Bedrock** | `wrapBedrock()` | `wrap_bedrock()` | Manual | Medium — polymorphic response body per model vendor |

**Note:** OpenAI wrapping covers OpenAI + Azure OpenAI + Groq (all OpenAI-compatible) with one function.

---

## SDK Architecture

```
@optimai/sdk
├── core/
│   ├── telemetry.ts        # Event batcher, transport, retry logic
│   ├── config.ts           # Config fetching, caching (auto-optimize rules)
│   ├── pricing.ts          # Embedded model pricing for client-side cost calc
│   └── routing.ts          # Auto-optimize model selection logic
├── providers/
│   ├── openai.ts           # wrapOpenAI() — covers OpenAI, Azure, Groq
│   ├── anthropic.ts        # wrapAnthropic()
│   ├── google.ts           # wrapGoogleAI()
│   └── bedrock.ts          # wrapBedrock()
├── index.ts                # initOptim(), all wrap exports
└── types.ts                # TelemetryEvent, OptimConfig, etc.
```

### Telemetry Event Shape

```typescript
interface TelemetryEvent {
  // Identity
  projectKey: string
  requestId: string           // UUID generated by SDK

  // Request metadata
  provider: string            // "openai" | "anthropic" | "google" | "groq" | "azure" | "bedrock"
  model: string               // Actual model used (after routing)
  originalModel?: string      // Original model if auto-optimized

  // Usage
  promptTokens: number
  completionTokens: number
  totalTokens: number

  // Cost (calculated client-side from embedded pricing)
  estimatedCost: number

  // Performance
  latencyMs: number
  isStreaming: boolean

  // Status
  status: "success" | "error"
  errorType?: string          // "rate_limit" | "timeout" | "auth" | "aborted"
  statusCode?: number

  // Context (user-provided, optional)
  tags?: Record<string, string>
  userId?: string
  feature?: string

  // SDK metadata
  sdkVersion: string
  runtime: string             // "node" | "python" | "edge" | "rest"
  timestamp: string           // ISO 8601
}
```

### Telemetry Batching

- Queue events in memory, flush every **5 seconds** or when batch hits **25 events**
- **Fire-and-forget** — telemetry never blocks the LLM call
- Silent retry with exponential backoff (5s → 10s → 30s), drop after 3 failures
- Max queue: 1000 events, drop oldest on overflow
- Node.js: `process.on('beforeExit')` for final flush
- Edge/Vercel: `waitUntil()` from `next/server`
- Python: `atexit` handler for final flush

### Streaming Support

- **OpenAI:** SDK auto-injects `stream_options: { include_usage: true }`. Usage arrives in final chunk
- **Anthropic:** Final `message_delta` event contains output tokens. `MessageStream.finalMessage()` aggregates
- **Google:** `usageMetadata` available after stream completes
- **Bedrock:** Final chunk contains `amazon-bedrock-invocationMetrics`
- SDK wraps the async iterator, yields chunks transparently, fires telemetry after stream ends

### Auto-Optimization (Client-Side)

**Scope:** Intra-provider model downgrades only. Cross-provider routing is not feasible in a wrapper pattern.

**How it works:**
1. SDK fetches project's auto-optimize config on init (cached, refreshed every 30s in background)
2. Before each LLM call, SDK checks if the requested model has a cheaper alternative
3. If enabled and rules match, SDK swaps `params.model` before forwarding to the provider
4. Tracks both `originalModel` and actual `model` used in telemetry

**Example routing rules:**

| Original Model | Routed To | Savings |
|---------------|-----------|---------|
| `gpt-4o` | `gpt-4o-mini` | ~15x cheaper |
| `claude-sonnet-4-20250514` | `claude-3-5-haiku-20241022` | ~10x cheaper |
| `gemini-1.5-pro` | `gemini-1.5-flash` | ~7x cheaper |
| `llama-3.3-70b-versatile` | `llama-3.1-8b-instant` | ~4x cheaper |

**Safety:** Users configure quality tolerance (strict/moderate/aggressive) and can exclude specific endpoints.

**Zero latency:** Config is cached locally. No network call per request.

---

## Projects System

Projects are the **central organizing unit**. All tracking, analytics, recommendations, and auto-optimize configs are scoped to a project.

### Project Setup Page (replaces API Keys page)

When a user creates a project, they provide:

| Field | Required | Description |
|-------|----------|-------------|
| **Project Name** | Yes | e.g., "Customer Support Bot" |
| **Description** | No | What the project does |
| **AI Providers** | Yes | Multi-select: OpenAI, Anthropic, Google, Groq, Azure, Bedrock |
| **Models Used** | Yes | Checkboxes filtered by selected providers |
| **SDK Platform** | Yes | Node.js / Python / REST API |

**On save:**
1. Creates a `Project` record with a generated project key (`opt_proj_xxxxxxxxxxxx`)
2. Shows a setup page with:
   - The project key (copy button)
   - Install command for the selected platform (`npm install @optimai/sdk` or `pip install optim-sdk`)
   - Copy-paste setup code snippet tailored to their selected providers
   - A "Verify Installation" button that checks if telemetry has been received

### Project Data Model

```prisma
model Project {
  id              String   @id @default(cuid())
  name            String
  description     String?
  projectKey      String   @unique  // opt_proj_xxxxxxxxxxxx
  providers       String   // JSON array: ["openai", "anthropic"]
  models          String   // JSON array: ["gpt-4o", "claude-sonnet-4-20250514"]
  sdkPlatform     String   // "nodejs" | "python" | "rest"
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  requests        Request[]
  dailySummaries  DailySummary[]
  autoOptimize    AutoOptimizeConfig?
  recommendations Recommendation[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastActivityAt  DateTime?

  @@index([organizationId])
  @@index([projectKey])
}
```

---

## Dashboard Design

### General Dashboard (Overview)

The main `/dashboard` page shows a **high-level overview across all projects**:

**Top section:**
- Total spend (all projects, this period)
- Total requests (all projects)
- Total tokens consumed
- Number of active projects

**Project comparison section ("All Projects" view):**
- **Bar chart:** Cost per project (side-by-side comparison)
- **Ranking table:** Projects sorted by cost, with columns for:
  - Project name
  - Total cost this period
  - Request count
  - Primary model used
  - Cost trend (up/down vs last period)
  - Status indicator (active / inactive)
- **Highlight cards:** Most expensive project, fastest growing project, best cost-per-request project

**Project selector dropdown** in the header — quick filter to scope the overview stats to one project without leaving the page.

### Dedicated Projects Page (`/dashboard/projects`)

A **card grid** listing all projects with at-a-glance metrics:

Each project card shows:
- Project name + description
- SDK platform badge (Node.js / Python / REST)
- Provider icons (OpenAI, Anthropic, etc.)
- Key stats: total cost, requests count, last active
- Status dot (green = active in last 24h, gray = inactive)

**Click a project card** → enters the **per-project dashboard** (`/dashboard/projects/[id]`):

**Per-Project Dashboard contains:**
- All analytics scoped to that project only
- Cost over time chart (line/area)
- Cost by model breakdown (pie/bar)
- Cost by provider breakdown
- Request history table (recent requests with model, tokens, cost, latency, status)
- Auto-optimize toggle + config (specific to this project)
- Project-specific AI recommendations
- Setup code / project key (re-accessible)
- Project settings (edit name, description, models, etc.)

### Dashboard Navigation

```
/dashboard                    → Overview + all-project comparison
/dashboard/projects           → Project cards grid
/dashboard/projects/[id]      → Per-project detailed dashboard
/dashboard/recommendations    → AI recommendations (with project selector)
/dashboard/benchmarks         → Cross-project benchmarking
/dashboard/settings           → User profile, account settings
```

---

## AI Recommendations

### Project-Aware Recommendations

The recommendations page has a **project selector toggle** at the top:
- **All Projects** — cross-project analysis
- **Specific Project** — dropdown to select one project

### Per-Project Recommendations

When a specific project is selected, the AI analyzes that project's usage:

- Token usage patterns by endpoint/feature
- Inefficient model choices (using GPT-4o for simple classification)
- Caching opportunities (repeated similar prompts)
- Prompt optimization (reduce token count)
- Cost anomalies (sudden spikes)

### Cross-Project Recommendations

When "All Projects" is selected, the AI performs comparative analysis:

- "Project A uses `gpt-4o` for summarization at $X/mo. Project B uses `gpt-4o-mini` for the same task at $Y/mo. Consider switching Project A."
- "Project C has 40% cache-eligible requests. Enable caching to save ~$Z/mo."
- "Your total spend increased 25% this week. Project D accounts for 80% of the increase."
- Overall budget efficiency score across all projects

### Implementation

- Uses Groq (`llama-3.3-70b-versatile`) with structured JSON output
- Input: aggregated usage data (never raw prompts)
- Output: prioritized list of recommendations with estimated savings + implementation effort
- Recommendations are **persisted** to the database and shown until dismissed
- Auto-refresh: new recommendations generated weekly or on-demand

---

## API Design

### Ingest (SDK → Cloud)

```
POST /api/v1/ingest
Authorization: Bearer opt_proj_...
Body: { events: TelemetryEvent[] }
Response: { accepted: number, rejected: number }
```

- Authenticated by project key
- Accepts batched events (1-100 per request)
- Validates event shape, rejects malformed
- Writes to `Request` table, updates `DailySummary`

### Dashboard APIs (all authenticated by user session)

```
GET  /api/v1/projects                        # List user's projects
POST /api/v1/projects                        # Create project (returns key + setup code)
GET  /api/v1/projects/:id                    # Get project details
PUT  /api/v1/projects/:id                    # Update project
DEL  /api/v1/projects/:id                    # Delete project

GET  /api/v1/costs?projectId=...&period=...  # Cost analytics (scoped to project or all)
GET  /api/v1/requests?projectId=...          # Request history

GET  /api/v1/auto-optimize?projectId=...     # Get auto-optimize config
PUT  /api/v1/auto-optimize                   # Update config

POST /api/v1/recommendations                 # Generate recommendations
GET  /api/v1/recommendations?projectId=...   # Get stored recommendations

GET  /api/v1/models                          # Model catalog + pricing
GET  /api/v1/user/preferences                # User profile + onboarding data
POST /api/v1/onboarding                      # Complete onboarding
```

**All dashboard APIs require session auth.** No more bare `organizationId` query params.

---

## Data Model Changes (from current schema)

### Remove
- `ApiKey.key` field (raw provider API key storage) — replaced by `Project.projectKey`

### Rename / Repurpose
- `ApiKey` table → **`Project`** table (central unit with project key for SDK auth)

### Add
- `Project.name`, `Project.description`, `Project.providers`, `Project.models`, `Project.sdkPlatform`
- `Project.lastActivityAt` — updated on each ingest
- `Request.projectId` — foreign key to Project (replaces `apiKeyId`)
- `DailySummary.projectId` — scoped summaries per project
- `Recommendation.projectId` — scoped recommendations per project

### Keep
- `Organization`, `User`, `Session`, `Account`, `Verification` — auth layer unchanged
- `AutoOptimizeConfig` — re-keyed from org to project
- `Request` — same fields, just scoped to project instead of API key
- `DailySummary` — same aggregation, scoped to project
- `Model` table / `model-pricing.ts` — pricing reference unchanged
- `Budget`, `Alert` — future use, now scoped to project

---

## Edge Cases & Technical Details

### Streaming
SDK wraps async iterators transparently. Telemetry fires after stream ends. Token counts extracted from final chunk/event per provider.

### Provider SDK Versioning
All provider SDKs declared as **optional peer dependencies** with semver ranges. SDK only wraps what's installed. CI tests against provider SDK betas.

### TypeScript Type Safety
Wrapper functions return the same type: `wrapOpenAI<T extends OpenAI>(client: T): T`. In-place mutation preserves all method signatures, overloads, and generics.

### Edge Runtime (Vercel)
Works for all providers except AWS Bedrock (relies on Node.js crypto). SDK detects runtime and adapts (uses `waitUntil()` on edge, `process.on('beforeExit')` on Node.js).

### Pricing Staleness
Model pricing embedded in SDK releases. Dashboard can override with server-side pricing. SDK checks for pricing updates during config refresh.

### Rate Limiting
- Client: max 100 events/second, drop excess silently
- Server: `429` with `Retry-After` header, SDK respects it
- Degradation: if endpoint consistently fails, SDK disables and logs warning. Re-checks every 5 minutes

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Redesign Prisma schema (Project model, remove raw key storage)
- Build `POST /api/v1/ingest` endpoint with project key auth
- Build project CRUD APIs (`/api/v1/projects`)
- Build project setup page (create project, show setup code)
- Add session auth to all existing API routes
- Build `wrapOpenAI()` for Node.js SDK (covers OpenAI + Azure + Groq)

### Phase 2: Dashboard + Analytics (Week 2-3)
- Build projects page (card grid)
- Build per-project dashboard (`/dashboard/projects/[id]`)
- Upgrade main dashboard with all-projects comparison view
- Add project selector dropdown to header
- Connect cost analytics to project-scoped queries
- Wire up DailySummary aggregation per project

### Phase 3: More Providers + Python SDK (Week 3-4)
- Build `wrapAnthropic()` for Node.js
- Build `wrapGoogleAI()` for Node.js
- Build `wrapBedrock()` for Node.js
- Build Python SDK (`optim-sdk`) with same wrapper pattern
- Document REST API endpoint for other languages

### Phase 4: Auto-Optimization (Week 4-5)
- Build config fetch + caching in SDK
- Implement intra-provider routing logic in SDK
- Build per-project auto-optimize config UI
- Track `originalModel` vs `model` in telemetry
- Show optimization savings in dashboard

### Phase 5: AI Recommendations (Week 5-6)
- Add project selector toggle to recommendations page
- Implement per-project recommendation generation (Groq)
- Implement cross-project comparative recommendations
- Persist recommendations to database
- Show estimated savings and implementation effort

### Phase 6: Polish & Launch (Week 6-7)
- Project comparison charts and ranking tables
- Budgets and alerts (per-project)
- Setup verification ("Verify Installation" check)
- SDK documentation site
- npm publish `@optimai/sdk`, PyPI publish `optim-sdk`
- End-to-end testing across all providers

---

## Verification

1. **SDK Integration:** Install SDK in a test project, make LLM calls, verify telemetry appears in dashboard within 5 seconds
2. **Project Isolation:** Create 2 projects, send requests with different project keys, verify analytics are scoped correctly
3. **Auto-Optimize:** Enable auto-optimize on a project, send a `gpt-4o` request, verify it gets routed to `gpt-4o-mini` and both models are tracked
4. **Streaming:** Make a streaming request, verify token counts are captured after stream ends
5. **Recommendations:** Generate recommendations for a project with 50+ requests, verify they reference actual usage patterns
6. **Cross-Project:** Select "All Projects," verify comparison charts show correct per-project breakdowns
7. **REST API:** Send raw HTTP POST to `/api/v1/ingest` with a valid project key, verify it's tracked
8. **Python SDK:** Run the same test suite as Node.js, verify parity
9. **Edge Runtime:** Deploy to Vercel, verify SDK works in serverless and edge functions
10. **Failure Resilience:** Kill the ingest endpoint, verify SDK degrades silently and LLM calls still work

---

## Sources

- [Braintrust wrapOpenAI](https://www.braintrust.dev/docs/guides/tracing) — Production-proven SDK wrapper pattern
- [Helicone](https://docs.helicone.ai/) — Proxy-based alternative, validates market need
- [Vercel Analytics](https://vercel.com/docs/analytics) — Inspiration for the install-and-track DX
- [RouteLLM](https://arxiv.org/abs/2406.18665) — Dynamic model routing research (2x cost reduction)
- [IPR: Intelligent Prompt Routing](https://arxiv.org/abs/2509.06274) — Quality-cost tradeoff (43.9% cost reduction)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference) — Token usage in responses
- [Anthropic API Reference](https://docs.anthropic.com/en/api) — Message response shape with usage
- [Google GenAI SDK](https://ai.google.dev/api) — usageMetadata in responses
