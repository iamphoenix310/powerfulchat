// app/api/user/user-detail/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]{ _id, subscriptionActive, subscriptionCredits }`,
      { email }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('❌ Failed to fetch user details:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}
