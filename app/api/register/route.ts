// app/api/register/route.ts
import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { email, name, username, password } = await req.json()
  const hashedPassword = await bcrypt.hash(password, 10); // ✅ move hashing here

  const existingEmail = await client.fetch(
    `*[_type == "user" && email == $email][0]`,
    { email }
  )

  const existingUsername = await client.fetch(
    `*[_type == "user" && username == $username][0]`,
    { username }
  )

  if (existingEmail) {
    return NextResponse.json({ error: 'Email already registered.' }, { status: 400 })
  }

  if (existingUsername) {
    return NextResponse.json({ error: 'Username already taken.' }, { status: 400 })
  }

  await client.create({
    _type: 'user',
    name,
    email,
    username,
    hashedPassword,
    subscriptionCredits: 0,
    karmaPoints: 0,
    role: 'normal',
    adFree: false,
    likedImages: [],
    image: '',
  })

  return NextResponse.json({ success: true })
}
