import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: NextRequest) {
  try {
    const { imageId, productId } = await req.json()

    if (!imageId && !productId) {
      return NextResponse.json({ error: 'Missing imageId or productId' }, { status: 400 })
    }

    const docId = imageId || productId
    const docType = imageId ? 'images' : 'product'

    await client.patch(docId)
      .setIfMissing({ downloads: 0 })
      .inc({ downloads: 1 })
      .commit()

    console.log(`✅ Download tracked for ${docType} ${docId}`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Download tracking error:', err)
    return NextResponse.json({ error: 'Failed to track download' }, { status: 500 })
  }
}
