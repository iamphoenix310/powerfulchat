// app/api/music/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const {
    title,
    description,
    coverImage,
    r2FileUrl,
    isSingle = true,
    albumId = null,
    artistUser = null,
    lyricist,
    singer,
    composer,
    genre,
    duration,
    releaseDate,
  } = await req.json()

  const doc = {
    _type: 'musicTrack',
    title,
    slug: { _type: 'slug', current: title.toLowerCase().replace(/\s+/g, '-') },
    isSingle,
    album: albumId ? { _type: 'reference', _ref: albumId } : undefined,
    artist: artistUser ? { _type: 'reference', _ref: artistUser } : undefined,
    description,
    coverImage,
    r2FileUrl,
    lyricist,
    singer,
    composer,
    genre, // <-- must be an array of strings or references (match schema!)
    duration,
    releaseDate,
  }

  const createdTrack = await client.create(doc)

  // ✅ If part of an album, append to album's `songs` array with _key
  if (albumId) {
    await client
      .patch(albumId)
      .setIfMissing({ songs: [] })
      .append('songs', [{
        _type: 'reference',
        _ref: createdTrack._id,
        _key: uuidv4(),
      }])
      .commit()
  }

  return NextResponse.json({ success: true, id: createdTrack._id })
}
