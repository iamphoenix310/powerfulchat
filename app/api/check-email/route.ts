// app/api/check-email/route.ts
import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({ available: false })

  const user = await client.fetch(
    `*[_type == "user" && email == $email][0]`,
    { email }
  )

  return NextResponse.json({ available: !user })
}
