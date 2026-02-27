import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Organization',
    },
  })
  console.log('Created organization:', org.name)

  // Create demo API keys
  await prisma.apiKey.createMany({
    data: [
      {
        organizationId: org.id,
        key: 'sk-demo-openai',
        provider: 'openai',
        name: 'OpenAI Production',
      },
      {
        organizationId: org.id,
        key: 'sk-demo-anthropic',
        provider: 'anthropic',
        name: 'Anthropic Development',
      },
    ],
  })
  console.log('Created demo API keys')

  // Create demo requests for the past 30 days
  const models = [
    { model: 'gpt-4o', provider: 'openai', costMultiplier: 1 },
    { model: 'gpt-4o-mini', provider: 'openai', costMultiplier: 0.1 },
    { model: 'claude-3-5-sonnet-20241022', provider: 'anthropic', costMultiplier: 1.2 },
    { model: 'claude-3-5-haiku-20241022', provider: 'anthropic', costMultiplier: 0.3 },
    { model: 'gemini-1.5-flash', provider: 'google', costMultiplier: 0.15 },
  ]

  const apiKeys = await prisma.apiKey.findMany({
    where: { organizationId: org.id },
  })

  // Generate 200 random requests over the past 30 days
  for (let i = 0; i < 200; i++) {
    const modelInfo = models[Math.floor(Math.random() * models.length)]
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)]
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))

    const promptTokens = Math.floor(Math.random() * 2000) + 100
    const completionTokens = Math.floor(Math.random() * 1000) + 50
    const cost = ((promptTokens * 0.001 * modelInfo.costMultiplier) + (completionTokens * 0.004 * modelInfo.costMultiplier))

    await prisma.request.create({
      data: {
        organizationId: org.id,
        apiKeyId: apiKey.id,
        model: modelInfo.model,
        provider: modelInfo.provider,
        endpoint: '/chat/completions',
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        cost,
        latency: Math.floor(Math.random() * 3000) + 500,
        status: 'success',
        createdAt: date,
      },
    })

    // Update daily summary
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)

    await prisma.dailySummary.upsert({
      where: {
        organizationId_date: {
          organizationId: org.id,
          date: dayStart,
        },
      },
      update: {
        totalRequests: { increment: 1 },
        totalCost: { increment: cost },
        totalTokens: { increment: promptTokens + completionTokens },
        promptTokens: { increment: promptTokens },
        completionTokens: { increment: completionTokens },
      },
      create: {
        organizationId: org.id,
        date: dayStart,
        totalRequests: 1,
        totalCost: cost,
        totalTokens: promptTokens + completionTokens,
        promptTokens,
        completionTokens,
      },
    })
  }
  console.log('Created 200 demo requests')

  // Create auto-optimize config
  await prisma.autoOptimizeConfig.create({
    data: {
      organizationId: org.id,
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
        organizationId: org.id,
        type: 'model_selection',
        priority: 'high',
        title: 'Use GPT-4o Mini for simple requests',
        description: 'You have many simple requests that could use a cheaper model. Switching 50% of simple requests to GPT-4o Mini could save up to 40%.',
        estimatedSavings: 40,
        implementationEffort: 'low',
      },
      {
        organizationId: org.id,
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
