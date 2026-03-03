import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function generateProjectKey(): string {
  return 'opt_proj_' + crypto.randomBytes(18).toString('base64url').slice(0, 24).toLowerCase()
}

async function main() {
  console.log('Seeding database...')

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: {
      id: 'demo-org',
      name: 'Demo Organization',
    },
  })
  console.log('Created organization:', org.name, 'ID:', org.id)

  // Create demo projects
  const project1 = await prisma.project.upsert({
    where: { projectKey: 'opt_proj_demo_production_key_01' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Production API',
      description: 'Main production environment for customer-facing features',
      projectKey: 'opt_proj_demo_production_key_01',
      providers: JSON.stringify(['openai', 'anthropic']),
      models: JSON.stringify(['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022']),
      sdkPlatform: 'nodejs',
    },
  })
  console.log('Created project:', project1.name)

  const project2 = await prisma.project.upsert({
    where: { projectKey: 'opt_proj_demo_development_key02' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Development',
      description: 'Development and testing environment',
      projectKey: 'opt_proj_demo_development_key02',
      providers: JSON.stringify(['openai', 'google']),
      models: JSON.stringify(['gpt-4o-mini', 'gemini-1.5-flash']),
      sdkPlatform: 'nodejs',
    },
  })
  console.log('Created project:', project2.name)

  const project3 = await prisma.project.upsert({
    where: { projectKey: 'opt_proj_demo_internal_tools_03' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Internal Tools',
      description: 'Internal automation and reporting tools',
      projectKey: 'opt_proj_demo_internal_tools_03',
      providers: JSON.stringify(['anthropic']),
      models: JSON.stringify(['claude-3-5-haiku-20241022']),
      sdkPlatform: 'python',
    },
  })
  console.log('Created project:', project3.name)

  const projects = [project1, project2, project3]

  const models = [
    { model: 'gpt-4o', provider: 'openai', costMultiplier: 1 },
    { model: 'gpt-4o-mini', provider: 'openai', costMultiplier: 0.1 },
    { model: 'claude-3-5-sonnet-20241022', provider: 'anthropic', costMultiplier: 1.2 },
    { model: 'claude-3-5-haiku-20241022', provider: 'anthropic', costMultiplier: 0.3 },
    { model: 'gemini-1.5-flash', provider: 'google', costMultiplier: 0.15 },
  ]

  // Generate 200 random requests over the past 30 days
  const requestData = []
  const dailySummaryMap = new Map<string, {
    projectId: string
    date: Date
    totalRequests: number
    totalCost: number
    totalTokens: number
    promptTokens: number
    completionTokens: number
    costByModel: Record<string, number>
    costByProvider: Record<string, number>
  }>()

  for (let i = 0; i < 200; i++) {
    const modelInfo = models[Math.floor(Math.random() * models.length)]
    const project = projects[Math.floor(Math.random() * projects.length)]
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))

    const promptTokens = Math.floor(Math.random() * 2000) + 100
    const completionTokens = Math.floor(Math.random() * 1000) + 50
    const cost = (promptTokens * 0.001 * modelInfo.costMultiplier) + (completionTokens * 0.004 * modelInfo.costMultiplier)
    const latencyMs = Math.floor(Math.random() * 3000) + 500

    requestData.push({
      projectId: project.id,
      model: modelInfo.model,
      provider: modelInfo.provider,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      cost,
      latencyMs,
      isStreaming: Math.random() > 0.7,
      status: Math.random() > 0.95 ? 'error' : 'success',
      createdAt: date,
    })

    // Aggregate daily summaries in memory
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const key = `${project.id}_${dayStart.toISOString()}`

    if (!dailySummaryMap.has(key)) {
      dailySummaryMap.set(key, {
        projectId: project.id,
        date: dayStart,
        totalRequests: 0,
        totalCost: 0,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        costByModel: {},
        costByProvider: {},
      })
    }
    const ds = dailySummaryMap.get(key)!
    ds.totalRequests++
    ds.totalCost += cost
    ds.totalTokens += promptTokens + completionTokens
    ds.promptTokens += promptTokens
    ds.completionTokens += completionTokens
    ds.costByModel[modelInfo.model] = (ds.costByModel[modelInfo.model] || 0) + cost
    ds.costByProvider[modelInfo.provider] = (ds.costByProvider[modelInfo.provider] || 0) + cost
  }

  // Batch create requests
  await prisma.request.createMany({ data: requestData })
  console.log('Created 200 demo requests')

  // Batch create daily summaries
  const dailySummaryData = Array.from(dailySummaryMap.values()).map((ds) => ({
    projectId: ds.projectId,
    date: ds.date,
    totalRequests: ds.totalRequests,
    totalCost: ds.totalCost,
    totalTokens: ds.totalTokens,
    promptTokens: ds.promptTokens,
    completionTokens: ds.completionTokens,
    costByModel: JSON.stringify(ds.costByModel),
    costByProvider: JSON.stringify(ds.costByProvider),
  }))
  await prisma.dailySummary.createMany({ data: dailySummaryData })
  console.log('Created daily summaries')

  // Update project lastActivityAt
  for (const project of projects) {
    const lastReq = await prisma.request.findFirst({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
    })
    if (lastReq) {
      await prisma.project.update({
        where: { id: project.id },
        data: { lastActivityAt: lastReq.createdAt },
      })
    }
  }

  // Create auto-optimize config for production project
  await prisma.autoOptimizeConfig.upsert({
    where: { projectId: project1.id },
    update: {},
    create: {
      projectId: project1.id,
      isEnabled: false,
      maxSavingsTarget: 0.3,
      qualityTolerance: 'moderate',
    },
  })
  console.log('Created auto-optimize config')

  // Create some demo recommendations
  await prisma.recommendation.createMany({
    data: [
      {
        projectId: project1.id,
        type: 'model_selection',
        priority: 'high',
        title: 'Use GPT-4o Mini for simple requests',
        description: 'You have many simple requests that could use a cheaper model. Switching 50% of simple requests to GPT-4o Mini could save up to 40%.',
        estimatedSavings: 40,
        implementationEffort: 'low',
      },
      {
        projectId: project2.id,
        type: 'caching',
        priority: 'medium',
        title: 'Enable response caching',
        description: 'Detected 15% repeated prompts. Implementing caching could reduce costs significantly.',
        estimatedSavings: 15,
        implementationEffort: 'medium',
      },
    ],
  })
  console.log('Created demo recommendations')

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
