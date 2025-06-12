import crypto from 'crypto'
import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const {
      imageId,
      productId,
      userEmail,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      price,
      subscriptionPurchase,
      planName,
      credits
    } = await req.json()

    if (!userEmail || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

    // ✅ CASE 1: Subscription
    if (subscriptionPurchase) {
      await client.patch(user._id)
        .set({ subscriptionActive: true, subscriptionStartDate: new Date().toISOString(), freeTrialActive: false })
        .inc({ subscriptionCredits: credits })
        .commit()

      await client.create({
        _type: 'buysub',
        user: { _type: 'reference', _ref: user._id },
        planName: planName || 'Unknown Plan',
        amount: price,
        creditsPurchased: credits,
        paymentStatus: 'success',
        paymentId: razorpay_payment_id,
        createdAt: new Date().toISOString(),
      })

      return NextResponse.json({ success: true, message: 'Subscription purchased successfully' })
    }

    // ✅ CASE 2: Product Purchase
    if (productId) {
      const alreadyPurchased = await client.fetch(
        `*[_type == "productPurchase" && user._ref == $userId && product._ref == $productId][0]._id`,
        { userId: user._id, productId }
      )

      if (alreadyPurchased) {
        return NextResponse.json({ success: true, message: 'Product already purchased' })
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
    }

    // ✅ CASE 3: Image Purchase (default legacy flow)
    if (imageId) {
      const alreadyPurchased = await client.fetch(
        `*[_type == "purchase" && user._ref == $userId && image._ref == $imageId][0]._id`,
        { userId: user._id, imageId }
      )

      if (alreadyPurchased) {
        return NextResponse.json({ success: true, message: 'Image already purchased' })
      }

      await client.create({
        _type: 'purchase',
        user: { _type: 'reference', _ref: user._id },
        image: { _type: 'reference', _ref: imageId },
        paymentId: razorpay_payment_id,
        amount: price,
        status: 'completed',
      })

      return NextResponse.json({ success: true, message: 'Image purchased successfully' })
    }

    return NextResponse.json({ success: false, error: 'No product or image ID provided' }, { status: 400 })
  } catch (err) {
    console.error('💥 Razorpay verify error:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
