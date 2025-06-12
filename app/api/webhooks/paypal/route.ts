// route.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 🔍 Optional: verify signature using PAYPAL_WEBHOOK_ID and secrets
    // PayPal sends headers like: paypal-transmission-id, paypal-cert-url etc.

    const eventType = body.event_type
    const resource = body.resource

    console.log('🟡 PayPal Webhook received:', eventType)

    // ✅ For successful purchases
    if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      const email = resource?.payer?.email_address
      const purchaseId = resource?.id

      // You can log or store here (optional)
      console.log('✅ Purchase approved by:', email, 'ID:', purchaseId)
    }

    // Optionally handle refund events, etc.
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('❌ PayPal Webhook Error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
