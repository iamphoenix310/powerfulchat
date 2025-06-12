// app/api/razorpay/order/route.ts
import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { price, imageId, userEmail } = await req.json()

    if (!price || !imageId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields (price, imageId, userEmail)' },
        { status: 400 }
      )
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const amountInPaise = Math.round(price * 100)

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `img_${Date.now()}`, // ✅ safe under 40 chars
      partial_payment: false,
      notes: {
        imageId,
        userEmail,
        origin: 'visitpowerful.com',
      },
    })

    if (!order?.id) {
      throw new Error('Razorpay did not return a valid order ID')
    }

    console.log('✅ Razorpay Order Created:', order.id)

    return NextResponse.json({ order })
  } catch (err: any) {
    console.error('💥 Razorpay Order Creation Error:', err.message || err)
    return NextResponse.json(
      { error: 'Failed to create Razorpay order' },
      { status: 500 }
    )
  }
}
