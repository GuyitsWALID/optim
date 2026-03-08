import { NextResponse } from 'next/server'
import { requireSessionWithOrg } from '@/lib/api-auth'
import { getWhopClient, WHOP_PLANS } from '@/lib/whop'

export async function POST(request: Request) {
  const { session, organizationId, response } = await requireSessionWithOrg(request)
  if (response) return response

  const body = await request.json().catch(() => ({}))
  const plan = body?.plan === 'enterprise' ? 'enterprise' : 'pro'
  const billingCycle = body?.billingCycle === 'annual' ? 'annual' : 'monthly'

  let planId: string
  if (plan === 'enterprise') {
    planId = WHOP_PLANS.ENTERPRISE
  } else {
    planId = billingCycle === 'annual' ? WHOP_PLANS.PRO_ANNUAL : WHOP_PLANS.PRO_MONTHLY
  }

  if (!planId) {
    return NextResponse.json(
      { error: 'Checkout is not configured. Missing Whop plan ID environment variables.' },
      { status: 500 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const whop = getWhopClient()
    const checkout = await whop.checkoutConfigurations.create({
      plan_id: planId,
      mode: 'payment',
      redirect_url: `${appUrl}/dashboard?billing=success`,
      source_url: `${appUrl}/checkout`,
      metadata: {
        organizationId,
        userId: session?.user.id,
        email: session?.user.email,
        planId,
        ...(body?.companyName ? { companyName: body.companyName } : {}),
        ...(body?.companySize ? { companySize: body.companySize } : {}),
      },
    })

    return NextResponse.json({
      checkoutUrl: checkout.purchase_url,
    })
  } catch (error) {
    console.error('Whop checkout creation failed:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
