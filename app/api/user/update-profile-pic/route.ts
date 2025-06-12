import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: NextRequest) {
  const { userId, assetId } = await req.json()

  if (!userId || !assetId) {
    return NextResponse.json({ error: 'Missing userId or assetId' }, { status: 400 })
  }

  try {
    await client
      .patch(userId)
      .set({
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId,
          },
        },
      })
      .commit()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Failed to update user image:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
