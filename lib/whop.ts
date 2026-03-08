import Whop from '@whop/sdk'

let whopClient: Whop | null = null

export function getWhopClient(): Whop {
  if (!process.env.WHOP_API_KEY) {
    throw new Error('WHOP_API_KEY is missing')
  }

  if (!whopClient) {
    whopClient = new Whop({
      apiKey: process.env.WHOP_API_KEY,
      appID: process.env.NEXT_PUBLIC_WHOP_APP_ID,
      webhookKey: process.env.WHOP_WEBHOOK_SECRET,
    })
  }

  return whopClient
}

export const WHOP_PLANS = {
  PRO_MONTHLY: process.env.WHOP_PRO_MONTHLY_PLAN_ID || '',
  PRO_ANNUAL: process.env.WHOP_PRO_ANNUAL_PLAN_ID || '',
  ENTERPRISE: process.env.WHOP_ENTERPRISE_PLAN_ID || '',
}
