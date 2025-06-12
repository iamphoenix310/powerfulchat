import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { client } from '@/app/utils/sanityClient'

// (No 'export const runtime = "edge"')

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const originalFilename = formData.get('originalFilename') as string

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  try {
    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Sanity
    const imageAsset = await client.assets.upload('image', buffer, {
      filename: originalFilename || 'bg-removed.png',
      contentType: file.type || 'image/png',
    })
    console.log("Image asset uploaded:", imageAsset)

    // Save document
    const doc = await client.create({
      _type: 'bgRemovedImage',
      user: { _type: 'reference', _ref: session.user.id },
      image: { _type: 'image', asset: { _type: 'reference', _ref: imageAsset._id } },
      originalFilename,
      processedAt: new Date().toISOString(),
    })
    console.log("Sanity doc created:", doc)

    return NextResponse.json({ success: true, doc })
  } catch (e) {
    console.error('Sanity upload error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
