// app/api/generated-images/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export const dynamic = 'force-dynamic' // Force dynamic fetch

export async function POST(req: NextRequest) {
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const images = await client.fetch(
      `*[_type == "imageGeneration" && user._ref == $userId] | order(_createdAt desc){
        _id,
        prompt,
        "imageUrl": image.asset->url,
        aspectRatio,
        createdAt,
        status,
        model
      }`,
      { userId }
    )

    return NextResponse.json({ images })
  } catch (error) {
    console.error('❌ Failed to fetch generated images:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
