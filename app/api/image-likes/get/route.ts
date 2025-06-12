// /app/api/image-likes/get/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  const { imageId } = await req.json()

  if (!imageId) {
    return NextResponse.json({ success: false, error: 'Missing imageId' }, { status: 400 })
  }

  try {
    const data = await client.fetch(
      `*[_type == "images" && _id == $imageId][0]{ likes, likedBy[]->{_id} }`,
      { imageId }, {cache: 'no-store'}
    )

    return NextResponse.json({
      success: true,
      likes: data.likes,
      likedBy: data.likedBy,
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Fetch failed' }, { status: 500 })
  }
}
