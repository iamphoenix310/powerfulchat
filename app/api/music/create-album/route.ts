// app/api/music/create-album/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: NextRequest) {
  const { title, description, coverImage, lyricist } = await req.json()

  const doc = {
    _type: 'musicAlbum',
    title,
    slug: { _type: 'slug', current: title.toLowerCase().replace(/\s+/g, '-') },
    description,
    lyricist,
    coverImage,
  }

  const createdAlbum = await client.create(doc)
  return NextResponse.json({ success: true, id: createdAlbum._id })
}
