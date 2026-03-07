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
          return `import { wrapOpenAI } from '@optimai/sdk'\nimport OpenAI from 'openai'\n\nconst openai = wrapOpenAI(new OpenAI())`
        case 'anthropic':
          return `import { wrapAnthropic } from '@optimai/sdk'\nimport Anthropic from '@anthropic-ai/sdk'\n\nconst anthropic = wrapAnthropic(new Anthropic())`
        case 'google':
          return `import { wrapGoogleAI } from '@optimai/sdk'\nimport { GoogleGenerativeAI } from '@google/generative-ai'\n\nconst genAI = wrapGoogleAI(new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!))`
        case 'deepseek':
          return `import { wrapOpenAI } from '@optimai/sdk'\nimport OpenAI from 'openai'\n\n// DeepSeek uses an OpenAI-compatible API\nconst deepseek = wrapOpenAI(new OpenAI({\n  baseURL: 'https://api.deepseek.com/v1',\n  apiKey: process.env.DEEPSEEK_API_KEY,\n}))`
        case 'qwen':
          return `import { wrapOpenAI } from '@optimai/sdk'\nimport OpenAI from 'openai'\n\n// Qwen uses an OpenAI-compatible API (DashScope)\nconst qwen = wrapOpenAI(new OpenAI({\n  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',\n  apiKey: process.env.DASHSCOPE_API_KEY,\n}))`
        case 'mistral':
          return `import { wrapOpenAI } from '@optimai/sdk'\nimport OpenAI from 'openai'\n\n// Mistral uses an OpenAI-compatible API\nconst mistral = wrapOpenAI(new OpenAI({\n  baseURL: 'https://api.mistral.ai/v1',\n  apiKey: process.env.MISTRAL_API_KEY,\n}))`
        case 'zhipu':
          return `import { wrapOpenAI } from '@optimai/sdk'\nimport OpenAI from 'openai'\n\n// Zhipu GLM uses an OpenAI-compatible API\nconst zhipu = wrapOpenAI(new OpenAI({\n  baseURL: 'https://open.bigmodel.cn/api/paas/v4',\n  apiKey: process.env.ZHIPU_API_KEY,\n}))`
        case 'moonshot':
          return `import { wrapOpenAI } from '@optimai/sdk'\nimport OpenAI from 'openai'\n\n// Moonshot (Kimi) uses an OpenAI-compatible API\nconst moonshot = wrapOpenAI(new OpenAI({\n  baseURL: 'https://api.moonshot.cn/v1',\n  apiKey: process.env.MOONSHOT_API_KEY,\n}))`
        case 'minimax':
          return `import { wrapOpenAI } from '@optimai/sdk'\nimport OpenAI from 'openai'\n\n// MiniMax uses an OpenAI-compatible API\nconst minimax = wrapOpenAI(new OpenAI({\n  baseURL: 'https://api.minimax.chat/v1',\n  apiKey: process.env.MINIMAX_API_KEY,\n}))`
        case 'yi':
          return `import { wrapOpenAI } from '@optimai/sdk'\nimport OpenAI from 'openai'\n\n// 01.AI (Yi) uses an OpenAI-compatible API\nconst yi = wrapOpenAI(new OpenAI({\n  baseURL: 'https://api.lingyiwanwu.com/v1',\n  apiKey: process.env.YI_API_KEY,\n}))`
        case 'groq':
          return `import { wrapOpenAI } from '@optimai/sdk'\nimport OpenAI from 'openai'\n\n// Groq uses an OpenAI-compatible API\nconst groq = wrapOpenAI(new OpenAI({\n  baseURL: 'https://api.groq.com/openai/v1',\n  apiKey: process.env.GROQ_API_KEY,\n}))`
        case 'bedrock':
          return `import { wrapBedrock } from '@optimai/sdk'\nimport { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime'\n\nconst bedrock = wrapBedrock(new BedrockRuntimeClient())`
        default:
          return ''
      }
    }).filter(Boolean)

    return {
      installCommand: 'npm install @optimai/sdk openai',
      code: `import { initOptim } from '@optimai/sdk'\n\n// Initialize Optim (call once at startup)\ninitOptim({ projectKey: '${projectKey}', baseUrl: 'https://optim.dev' })\n\n${wrappers[0] || ''}\n\n// Use your AI client as normal — telemetry is automatic`,
    }
  }

  if (platform === 'python') {
    const wrappers = providers.map((p) => {
      switch (p) {
        case 'openai':
        case 'azure':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\nclient = wrap_openai(OpenAI())`
        case 'anthropic':
          return `from optim_sdk import wrap_anthropic\nimport anthropic\n\nclient = wrap_anthropic(anthropic.Anthropic())`
        case 'google':
          return `from optim_sdk import wrap_google\nimport google.generativeai as genai\n\nclient = wrap_google(genai)`
        case 'deepseek':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\n# DeepSeek uses an OpenAI-compatible API\nclient = wrap_openai(OpenAI(\n    base_url="https://api.deepseek.com/v1",\n    api_key=os.environ["DEEPSEEK_API_KEY"],\n))`
        case 'qwen':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\n# Qwen uses an OpenAI-compatible API (DashScope)\nclient = wrap_openai(OpenAI(\n    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",\n    api_key=os.environ["DASHSCOPE_API_KEY"],\n))`
        case 'mistral':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\n# Mistral uses an OpenAI-compatible API\nclient = wrap_openai(OpenAI(\n    base_url="https://api.mistral.ai/v1",\n    api_key=os.environ["MISTRAL_API_KEY"],\n))`
        case 'zhipu':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\n# Zhipu GLM uses an OpenAI-compatible API\nclient = wrap_openai(OpenAI(\n    base_url="https://open.bigmodel.cn/api/paas/v4",\n    api_key=os.environ["ZHIPU_API_KEY"],\n))`
        case 'moonshot':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\n# Moonshot (Kimi) uses an OpenAI-compatible API\nclient = wrap_openai(OpenAI(\n    base_url="https://api.moonshot.cn/v1",\n    api_key=os.environ["MOONSHOT_API_KEY"],\n))`
        case 'minimax':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\n# MiniMax uses an OpenAI-compatible API\nclient = wrap_openai(OpenAI(\n    base_url="https://api.minimax.chat/v1",\n    api_key=os.environ["MINIMAX_API_KEY"],\n))`
        case 'yi':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\n# 01.AI (Yi) uses an OpenAI-compatible API\nclient = wrap_openai(OpenAI(\n    base_url="https://api.lingyiwanwu.com/v1",\n    api_key=os.environ["YI_API_KEY"],\n))`
        case 'groq':
          return `from optim_sdk import wrap_openai\nfrom openai import OpenAI\n\n# Groq uses an OpenAI-compatible API\nclient = wrap_openai(OpenAI(\n    base_url="https://api.groq.com/openai/v1",\n    api_key=os.environ["GROQ_API_KEY"],\n))`
        case 'bedrock':
          return `from optim_sdk import wrap_bedrock\nimport boto3\n\nclient = wrap_bedrock(boto3.client("bedrock-runtime"))`
        default:
          return ''
      }
    }).filter(Boolean)

    return {
      installCommand: 'pip install optim-sdk openai',
      code: `import os\nfrom optim_sdk import init_optim\n\n# Initialize Optim (call once at startup)\ninit_optim(project_key="${projectKey}")\n\n${wrappers[0] || ''}\n\n# Use your AI client as normal — telemetry is automatic`,
    }
  }

  // REST API
  const provider = providers[0] || 'openai'
  const model = provider === 'deepseek' ? 'deepseek-r1'
    : provider === 'qwen' ? 'qwen-max'
    : provider === 'mistral' ? 'mistral-large-latest'
    : provider === 'zhipu' ? 'glm-4-plus'
    : provider === 'moonshot' ? 'moonshot-v1-128k'
    : provider === 'minimax' ? 'abab6.5s-chat'
    : provider === 'yi' ? 'yi-large'
    : provider === 'anthropic' ? 'claude-sonnet-4-20250514'
    : provider === 'google' ? 'gemini-2.5-pro'
    : 'gpt-4o'

  return {
    installCommand: '# No SDK needed — send HTTP requests directly',
    code: `curl -X POST https://app.optim.dev/api/v1/ingest \\\n  -H "Authorization: Bearer ${projectKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "events": [{\n      "provider": "${provider}",\n      "model": "${model}",\n      "promptTokens": 150,\n      "completionTokens": 50,\n      "latencyMs": 820,\n      "status": "success"\n    }]\n  }'`,
  }
}
