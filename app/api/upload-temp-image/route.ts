import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'
import { urlFor } from '@/app/utils/sanityClient' // assuming urlFor is exported from same file

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()

    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: file.name,
      contentType: file.type,
    })

    if (!asset?._id) {
      throw new Error('Sanity image upload failed')
    }

    // Wrap the asset in a mock "image field object" with .asset property to match urlFor's expectation
    const imageUrl = urlFor({ asset }).toString()

    if (!imageUrl || !imageUrl.startsWith('http')) {
      throw new Error('Invalid image URL generated')
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Temp upload error:', error)
    return NextResponse.json({ error: 'Failed to upload temp image' }, { status: 500 })
  }
}
