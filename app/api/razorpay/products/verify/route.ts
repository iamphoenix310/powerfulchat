// app/api/razorpay/products/verify/route.ts
import crypto from 'crypto'
import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const {
      productId,
      userEmail,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      price,
    } = await req.json()

    if (!productId || !userEmail || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Signature mismatch' }, { status: 400 })
    }

    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]{ _id }`,
      { email: userEmail }
    )

    if (!user?._id) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const alreadyPurchased = await client.fetch(
      `*[_type == "productPurchase" && user._ref == $userId && product._ref == $productId][0]._id`,
      { userId: user._id, productId }
    )

    if (alreadyPurchased) {
      return NextResponse.json({ success: true, message: 'Already purchased' })
    }

    await client.create({
      _type: 'productPurchase',
      user: { _type: 'reference', _ref: user._id },
      product: { _type: 'reference', _ref: productId },
      paymentId: razorpay_payment_id,
      amount: price,
      status: 'completed',
    })

    return NextResponse.json({ success: true, message: 'Product purchased successfully' })
  } catch (err) {
    console.error('❌ /razorpay/products/verify error:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
