import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const query = `*[_type == "user" && email == $email][0]{
    _id,
    name,
    username,
    profileImage
  }`

  const user = await client.fetch(query, { email })
  return NextResponse.json(user)
}
