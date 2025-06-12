// /app/api/unlike-image/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  const { imageId, userId } = await req.json()

  if (!imageId || !userId) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
  }

  try {
    const updated = await client
      .patch(imageId)
      .dec({ likes: 1 })
      .unset([`likedBy[_ref == "${userId}"]`])
      .commit()

    return NextResponse.json({
      success: true,
      likes: updated.likes,
      likedBy: updated.likedBy,
    })
  } catch (err) {
    console.error('[UNLIKE ERROR]', err)
    return NextResponse.json({ success: false, error: 'Failed to unlike image' }, { status: 500 })
  }
}
