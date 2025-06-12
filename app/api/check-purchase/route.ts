import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  const { imageId, productId, userEmail } = await req.json()

  if (!userEmail || (!imageId && !productId)) {
    return NextResponse.json({ hasPurchased: false, error: 'Missing fields' }, { status: 400 })
  }

  try {
    // 1. Get user ID from email
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]{ _id }`,
      { email: userEmail }
    )

    if (!user?._id) {
      return NextResponse.json({ hasPurchased: false, error: 'User not found' }, { status: 404 })
    }

    let purchase = null

    if (imageId) {
      // Check image purchase
      purchase = await client.fetch(
        `*[_type == "purchase" && user._ref == $userId && image._ref == $imageId][0]{ _id }`,
        { userId: user._id, imageId }
      )
    } else if (productId) {
      // Check product purchase
      purchase = await client.fetch(
        `*[_type == "purchase" && user._ref == $userId && product._ref == $productId][0]{ _id }`,
        { userId: user._id, productId }
      )
    }

    return NextResponse.json({ hasPurchased: !!purchase })
  } catch (err) {
    console.error('Error checking purchase:', err)
    return NextResponse.json({ hasPurchased: false, error: 'Internal error' }, { status: 500 })
  }
}
