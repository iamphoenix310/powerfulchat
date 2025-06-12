import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const user = await client.fetch(`*[_type == "user" && email == $email][0]{ _id }`, {
    email,
  })

  if (!user?._id) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ userId: user._id })
}
