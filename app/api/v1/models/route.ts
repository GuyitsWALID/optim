import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCost, modelPricing, getCheaperAlternatives } from '@/lib/model-pricing'

// GET /api/v1/models - List available models
export async function GET() {
  try {
    const models = modelPricing.map(m => ({
      name: m.name,
      provider: m.provider,
      displayName: m.displayName,
      inputPrice: m.inputPrice,
      outputPrice: m.outputPrice,
      contextWindow: m.contextWindow,
      capabilityTier: m.capabilityTier,
      supportsVision: m.supportsVision,
      supportsFunctionCalling: m.supportsFunctionCalling,
    }))

    return NextResponse.json({ models })
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
