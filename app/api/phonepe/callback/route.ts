// /app/api/phonepe/callback/route.ts
import { NextResponse } from 'next/server'
import { StandardCheckoutClient, Env } from 'pg-sdk-node'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const authHeader = req.headers.get('authorization') || ''

    const client = StandardCheckoutClient.getInstance(
      process.env.PHONEPE_CLIENT_ID!,
      process.env.PHONEPE_CLIENT_SECRET!,
      1,
      Env.SANDBOX
    )

    const result = client.validateCallback(
      process.env.PHONEPE_USERNAME!,
      process.env.PHONEPE_PASSWORD!,
      authHeader,
      body
    )

    console.log('📦 PhonePe Callback Validated:', result)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ PhonePe Callback Error:', err)
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
