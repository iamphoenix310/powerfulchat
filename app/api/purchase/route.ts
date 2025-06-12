import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  const { imageId, userEmail, paymentId, price } = await req.json()

  if (!imageId || !userEmail || !paymentId || !price) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // 1. Fetch the user ID from email
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]{ _id }`,
      { email: userEmail }
    )

    if (!user?._id) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // 2. Check if already purchased
    const existing = await client.fetch(
      `*[_type == "purchase" && user._ref == $userId && image._ref == $imageId][0]._id`,
      { userId: user._id, imageId }
    )

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already purchased' }) // allow frontend to continue
    }

    // 3. Create a new purchase document
    const purchaseDoc = {
      _type: 'purchase',
      user: { _type: 'reference', _ref: user._id },
      image: { _type: 'reference', _ref: imageId },
      paymentId,
      amount: price,
      status: 'completed',
    }

    await client.create(purchaseDoc)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to store purchase:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
