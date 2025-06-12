// app/api/credits/deduct/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  try {
    const { email, creditsToDeduct } = await req.json()

    if (!email || creditsToDeduct == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]{ _id, subscriptionCredits }`,
      { email }
    )

    if (!user?._id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if ((user.subscriptionCredits || 0) < creditsToDeduct) {
      return NextResponse.json({ error: 'Not enough credits' }, { status: 400 })
    }

    await client.patch(user._id)
      .dec({ subscriptionCredits: creditsToDeduct })
      .commit()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Failed to deduct credits:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}
