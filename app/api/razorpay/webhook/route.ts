import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.warn('⚠️ Webhook signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(rawBody)

    switch (payload.event) {
      case 'payment.captured':
        const payment = payload.payload.payment.entity
        console.log('💰 Payment Captured:', payment)
        // TODO: Optional DB record here
        break

      case 'subscription.created':
        console.log('📦 Subscription Created:', payload.payload.subscription.entity)
        break

      case 'subscription.activated':
        console.log('✅ Subscription Activated:', payload.payload.subscription.entity)
        break

      case 'subscription.charged':
        console.log('💳 Subscription Charged:', payload.payload.subscription.entity)
        break

      case 'subscription.cancelled':
        console.log('❌ Subscription Cancelled:', payload.payload.subscription.entity)
        break

      case 'subscription.completed':
        console.log('✔️ Subscription Completed:', payload.payload.subscription.entity)
        break

      default:
        console.log('ℹ️ Unhandled Razorpay Event:', payload.event)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('💥 Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 })
  }
}
