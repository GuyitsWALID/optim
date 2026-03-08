import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Get session - try both cookie and Authorization header
    const authHeader = request.headers.get('authorization')
    let session = null

    // First try cookie-based auth
    session = await auth.api.getSession({
      headers: request.headers,
    })

    // If no session from cookie, try Bearer token
    if (!session?.user && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      session = await auth.api.getSession({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    if (!session?.user) {
      return NextResponse.json({ preferences: null, onboardingCompleted: false }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          select: { tier: true },
        },
      },
    })

    if (!user || !user.onboardingCompleted) {
      return NextResponse.json({ preferences: null, onboardingCompleted: false }, { status: 200 })
    }

    const preferences = user.onboardingData ? JSON.parse(user.onboardingData) : null

    return NextResponse.json({
      preferences,
      organizationId: user.organizationId,
      tier: user.organization?.tier || 'FREE',
      onboardingCompleted: true,
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}
