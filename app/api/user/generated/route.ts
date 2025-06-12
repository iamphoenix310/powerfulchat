// app/api/user/generated/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { client } from '@/app/utils/sanityClient'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const images = await client.fetch(
    `*[_type == "imageGeneration" && user._ref == $userId] | order(_createdAt desc){
      _id,
      image,
      prompt,
      aspectRatio,
      status
    }`,
    { userId }
  )
  

  return NextResponse.json({ images })
}
