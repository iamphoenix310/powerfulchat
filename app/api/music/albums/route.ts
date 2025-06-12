import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' // 🔁 ensures fresh fetch every time
export const revalidate = 0 // ⏱ disables revalidation delay (if any)

export async function GET() {
  try {
    const rawAlbums = await client.fetch(
      `*[_type == "musicAlbum" && !(_id in path("drafts.**"))] | order(_createdAt desc)`,
      {}, // 👈 no query params
      { cache: 'no-store' } // 🚫 disables caching
    )

    const albums = Array.isArray(rawAlbums)
      ? rawAlbums.map((album: any) => ({
          _id: album._id,
          title: album.title,
          slug: typeof album.slug === 'string' ? album.slug : album.slug?.current,
          coverImage: album.coverImage,
          artist: typeof album.artist === 'string' ? album.artist : album.lyricist || 'Unknown Artist',
        }))
      : []

    return NextResponse.json(albums)
  } catch (err) {
    console.error('Error fetching albums:', err)
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 })
  }
}
