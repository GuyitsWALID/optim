import { NextRequest, NextResponse } from 'next/server'
import { getCheaperAlternatives } from '@/lib/model-pricing'
import { getModels } from '@/lib/openrouter'

// GET /api/v1/models - List available models (DB-first with static fallback)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const provider = searchParams.get('provider') || undefined
    const tier = searchParams.get('tier') || undefined
    const search = searchParams.get('search') || undefined

    const models = await getModels({ provider, tier, search })

    return NextResponse.json({
      models: models.map(m => ({
        name: m.name,
        provider: m.provider,
        displayName: m.displayName,
        inputPrice: m.inputPrice,
        outputPrice: m.outputPrice,
        contextWindow: m.contextWindow,
        capabilityTier: m.capabilityTier,
        supportsVision: m.supportsVision,
        supportsFunctionCalling: m.supportsFunctionCalling,
      })),
      count: models.length,
    })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}

// POST /api/v1/models/alternatives - Get cheaper alternatives for a model
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { modelName } = body

    if (!modelName) {
      return NextResponse.json({ error: 'modelName is required' }, { status: 400 })
    }

    const alternatives = getCheaperAlternatives(modelName)

    return NextResponse.json({ alternatives })
  } catch (error) {
    console.error('Error fetching alternatives:', error)
    return NextResponse.json({ error: 'Failed to fetch alternatives' }, { status: 500 })
  }
}
