import { NextResponse } from 'next/server'
import { syncModelsToDb } from '@/lib/openrouter'
import { prisma } from '@/lib/prisma'

// POST /api/v1/models/sync — Trigger a model sync from OpenRouter
export async function POST() {
  try {
    const result = await syncModelsToDb()

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}

// GET /api/v1/models/sync — Get last sync status
export async function GET() {
  try {
    const lastModel = await prisma.model.findFirst({
      where: { lastSyncedAt: { not: null } },
      orderBy: { lastSyncedAt: 'desc' },
      select: { lastSyncedAt: true },
    })

    const totalModels = await prisma.model.count({ where: { isActive: true } })

    return NextResponse.json({
      lastSyncedAt: lastModel?.lastSyncedAt?.toISOString() || null,
      totalModels,
    })
  } catch {
    return NextResponse.json({
      lastSyncedAt: null,
      totalModels: 0,
    })
  }
}
