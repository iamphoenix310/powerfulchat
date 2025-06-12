// /app/api/phonepe/order/route.ts
import { NextResponse } from 'next/server'
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from 'pg-sdk-node'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const { price, imageId, userEmail } = await req.json()

    if (!price || !imageId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = StandardCheckoutClient.getInstance(
      process.env.PHONEPE_CLIENT_ID!,
      process.env.PHONEPE_CLIENT_SECRET!,
      1,
      Env.SANDBOX // change to Env.PRODUCTION when live
    )

    const merchantOrderId = randomUUID()
    const amountInPaise = Math.round(price * 100)
    const redirectUrl = `${process.env.BASE_URL}/images/${imageId}?payment=success`

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl)
      .build()

    const response = await client.pay(request)
    return NextResponse.json({ redirectUrl: response.redirectUrl })

  } catch (err) {
    console.error('💥 PhonePe Order Error:', err)
    return NextResponse.json({ error: 'PhonePe order failed' }, { status: 500 })
  }
}
