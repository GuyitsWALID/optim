import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      useCases,
      projectType,
      teamSize,
      industry,
      role,
      usageFrequency,
      expertiseLevel,
      currentProviders,
      monthlySpend,
    } = body

    // Create organization if company type
    let organizationId = null
    if (projectType === 'company') {
      const org = await prisma.organization.create({
        data: {
          name: 'My Company',
        },
      })
      organizationId = org.id
    } else if (projectType === 'personal') {
      // Create a personal organization
      const org = await prisma.organization.create({
        data: {
          name: 'Personal',
        },
      })
      organizationId = org.id
    }

    // Store onboarding data
    const onboardingData = JSON.stringify({
      useCases,
      projectType,
      teamSize,
      industry,
      role,
      usageFrequency,
      expertiseLevel,
      currentProviders,
      monthlySpend,
    })

    // Update user with onboarding data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        onboardingData,
        organizationId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
