import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ preferences: null }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.onboardingCompleted) {
      return NextResponse.json({ preferences: null }, { status: 200 })
    }

    const preferences = user.onboardingData ? JSON.parse(user.onboardingData) : null

    return NextResponse.json({
      preferences,
      organizationId: user.organizationId,
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}
