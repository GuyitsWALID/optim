import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/v1/keys - Create a new API key
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organizationId, key, provider, name } = body

    if (!organizationId || !key || !provider) {
      return NextResponse.json(
        { error: 'organizationId, key, and provider are required' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existing = await prisma.apiKey.findUnique({
      where: { key },
    })

    if (existing) {
      return NextResponse.json({ error: 'API key already registered' }, { status: 409 })
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        organizationId,
        key,
        provider,
        name,
      },
    })

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        provider: apiKey.provider,
        createdAt: apiKey.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}

// GET /api/v1/keys - List API keys for an organization
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        provider: true,
        lastUsedAt: true,
        createdAt: true,
        _count: {
          select: { requests: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

// DELETE /api/v1/keys - Delete an API key
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'Key id is required' }, { status: 400 })
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
