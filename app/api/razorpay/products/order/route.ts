import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { productId, userEmail, price } = await req.json()

    if (!price || !productId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing productId, price, or userEmail' },
        { status: 400 }
      )
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const shortProductId = productId.slice(0, 8)
    const receipt = `prd_${shortProductId}_${Date.now()}` // ✅ Max ~30-35 chars
    const amount = Math.round(price * 100)

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      partial_payment: false,
      notes: {
        productId,
        userEmail,
      },
    })

    if (!order?.id) {
      throw new Error('Invalid Razorpay order object')
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    console.error('💥 Razorpay product order crash:', err)
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 })
  }
}
