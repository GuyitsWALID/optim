import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionWithOrg, generateProjectKey } from '@/lib/api-auth'

// GET /api/v1/projects — List all projects for the user's organization
export async function GET(request: Request) {
  const { organizationId, response } = await requireSessionWithOrg(request)
  if (response) return response

  const projects = await prisma.project.findMany({
    where: { organizationId: organizationId! },
    include: {
      _count: { select: { requests: true } },
      autoOptimize: { select: { isEnabled: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Enrich with cost data for each project
  const enriched = await Promise.all(
    projects.map(async (project) => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const costAgg = await prisma.request.aggregate({
        where: { projectId: project.id, createdAt: { gte: thirtyDaysAgo } },
        _sum: { cost: true },
      })

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        projectKey: project.projectKey,
        providers: JSON.parse(project.providers),
        models: JSON.parse(project.models),
        sdkPlatform: project.sdkPlatform,
        totalRequests: project._count.requests,
        totalCost30d: costAgg._sum.cost ?? 0,
        lastActivityAt: project.lastActivityAt,
        autoOptimizeEnabled: project.autoOptimize?.isEnabled ?? false,
        createdAt: project.createdAt,
      }
    })
  )

  return NextResponse.json({ projects: enriched })
}

// POST /api/v1/projects — Create a new project
export async function POST(request: Request) {
  const { organizationId, response } = await requireSessionWithOrg(request)
  if (response) return response

  const body = await request.json()
  const { name, description, providers, models, sdkPlatform } = body

  // Validate required fields
  if (!name || !providers || !Array.isArray(providers) || providers.length === 0) {
    return NextResponse.json(
      { error: 'name and providers are required' },
      { status: 400 }
    )
  }

  if (!models || !Array.isArray(models) || models.length === 0) {
    return NextResponse.json(
      { error: 'At least one model must be selected' },
      { status: 400 }
    )
  }

  if (!sdkPlatform || !['nodejs', 'python', 'rest'].includes(sdkPlatform)) {
    return NextResponse.json(
      { error: 'sdkPlatform must be one of: nodejs, python, rest' },
      { status: 400 }
    )
  }

  const projectKey = generateProjectKey()

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      projectKey,
      providers: JSON.stringify(providers),
      models: JSON.stringify(models),
      sdkPlatform,
      organizationId: organizationId!,
    },
  })

  // Generate setup instructions based on platform
  const setupCode = getSetupCode(sdkPlatform, projectKey, providers)

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      projectKey: project.projectKey,
      providers: JSON.parse(project.providers),
      models: JSON.parse(project.models),
      sdkPlatform: project.sdkPlatform,
      createdAt: project.createdAt,
    },
    setup: setupCode,
  })
}

function getSetupCode(
  platform: string,
  projectKey: string,
  providers: string[]
): { installCommand: string; code: string } {
  if (platform === 'nodejs') {
    const wrappers = providers.map((p) => {
      switch (p) {
        case 'openai':
        case 'azure':
        case 'groq':
          return `import { wrapOpenAI } from '@optim/sdk'\nimport OpenAI from 'openai'\n\nconst openai = wrapOpenAI(new OpenAI())`
        case 'anthropic':
          return `import { wrapAnthropic } from '@optim/sdk'\nimport Anthropic from '@anthropic-ai/sdk'\n\nconst anthropic = wrapAnthropic(new Anthropic())`
        case 'google':
          return `import { wrapGoogleAI } from '@optim/sdk'\nimport { GoogleGenerativeAI } from '@google/generative-ai'\n\nconst genAI = wrapGoogleAI(new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!))`
        case 'bedrock':
          return `import { wrapBedrock } from '@optim/sdk'\nimport { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime'\n\nconst bedrock = wrapBedrock(new BedrockRuntimeClient())`
        default:
          return ''
      }
    }).filter(Boolean)

    return {
      installCommand: 'npm install @optim/sdk',
      code: `import { initOptim } from '@optim/sdk'\n\n// Initialize Optim (call once at startup)\ninitOptim({ projectKey: '${projectKey}' })\n\n${wrappers[0] || ''}\n\n// Use your AI client as normal — telemetry is automatic`,
    }
  }

  if (platform === 'python') {
    const wrappers = providers.map((p) => {
      switch (p) {
        case 'openai':
        case 'azure':
        case 'groq':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\nclient = wrap_openai(OpenAI())`
        case 'anthropic':
          return `from optim_sdk import wrap_anthropic\nimport anthropic\n\nclient = wrap_anthropic(anthropic.Anthropic())`
        default:
          return ''
      }
    }).filter(Boolean)

    return {
      installCommand: 'pip install optim-sdk',
      code: `from optim_sdk import init_optim\n\n# Initialize Optim (call once at startup)\ninit_optim(project_key="${projectKey}")\n\n${wrappers[0] || ''}\n\n# Use your AI client as normal — telemetry is automatic`,
    }
  }

  // REST API
  return {
    installCommand: '# No SDK needed — send HTTP requests directly',
    code: `curl -X POST https://app.optim.dev/api/v1/ingest \\\n  -H "Authorization: Bearer ${projectKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "events": [{\n      "provider": "openai",\n      "model": "gpt-4o",\n      "promptTokens": 150,\n      "completionTokens": 50,\n      "latencyMs": 820,\n      "status": "success"\n    }]\n  }'`,
  }
}
