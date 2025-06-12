import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: 'Missing token or password' }, { status: 400 })
  }

  const user = await client.fetch(
    `*[_type == "user" && resetToken == $token][0]`,
    { token }
  )

  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
  }

  const isExpired = new Date(user.resetTokenExpiry) < new Date()
  if (isExpired) {
    return NextResponse.json({ error: 'Token has expired' }, { status: 410 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await client
    .patch(user._id)
    .set({
      hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    })
    .commit()

  return NextResponse.json({ success: true })
}
