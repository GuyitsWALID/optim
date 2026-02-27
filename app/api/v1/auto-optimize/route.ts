import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/v1/auto-optimize - Get auto-optimize configuration
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    let config = await prisma.autoOptimizeConfig.findUnique({
      where: { organizationId },
    })

    // Create default config if doesn't exist
    if (!config) {
      config = await prisma.autoOptimizeConfig.create({
        data: {
          organizationId,
          isEnabled: false,
          maxSavingsTarget: 0.3,
          qualityTolerance: 'moderate',
        },
      })
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error fetching auto-optimize config:', error)
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

// PUT /api/v1/auto-optimize - Update auto-optimize configuration
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { organizationId, ...updateData } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const config = await prisma.autoOptimizeConfig.upsert({
      where: { organizationId },
      update: updateData,
      create: {
        organizationId,
        ...updateData,
      },
    })

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error updating auto-optimize config:', error)
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
