import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'
import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const user = await client.fetch(
    `*[_type == "user" && email == $email][0]`,
    { email }
  )

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const token = uuidv4()
  const expiry = new Date(Date.now() + 1000 * 60 * 15) // 15 minutes

  await client.patch(user._id).set({
    resetToken: token,
    resetTokenExpiry: expiry.toISOString(),
  }).commit()

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset?token=${token}`

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Reset your Powerful password',
      html: `
        <h2>Hello, ${user.name || 'there'} 👋</h2>
        <p>You requested to reset your password on <strong>Powerful</strong>.</p>
        <p>Click the link below to reset it:</p>
        <a href="${resetUrl}" style="color:#3b82f6;">Reset your password</a>
        <p>This link is valid for 15 minutes.</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
