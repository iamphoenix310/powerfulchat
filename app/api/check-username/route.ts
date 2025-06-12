// app/api/check-username/route.ts
import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) return NextResponse.json({ available: false })

  const user = await client.fetch(
    `*[_type == "user" && username == $username][0]`,
    { username }
  )

  return NextResponse.json({ available: !user })
}
