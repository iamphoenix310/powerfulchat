import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as Blob

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType = file.type || 'image/jpeg'
    const asset = await client.assets.upload('image', buffer, {
      filename: 'uploaded-image',
      contentType,
    })

    return NextResponse.json({ assetId: asset._id }) // ✅ key fix
  } catch (err) {
    console.error('❌ Sanity image upload failed:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
