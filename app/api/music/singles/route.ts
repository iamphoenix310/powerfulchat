import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' // 🚫 disables static generation
export const revalidate = 0 // 🚫 disables ISR

export async function GET() {
  try {
    const rawSingles = await client.fetch(
      `*[_type == "musicTrack" && isSingle == true && !(_id in path("drafts.**"))] | order(_createdAt desc)`,
      {},
      { cache: 'no-store' } // ✅ bypass runtime cache
    )

    const singles = rawSingles.map((track: any) => ({
      _id: track._id,
      title: track.title,
      slug: typeof track.slug === 'string' ? track.slug : track.slug?.current,
      coverImage: track.coverImage,
      artist: typeof track.artist === 'string' ? track.artist : track.lyricist || 'Unknown Artist',
    }))

    return NextResponse.json(singles)
  } catch (err) {
    console.error('Error fetching singles:', err)
    return NextResponse.json({ error: 'Failed to fetch singles' }, { status: 500 })
  }
}
