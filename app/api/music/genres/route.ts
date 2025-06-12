import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function GET() {
  try {
    const genres = await client.fetch(`
      *[_type == "musicGenre" && defined(name)] {
        _id,
        name
      }
    `)

    return NextResponse.json({ genres })
  } catch (error) {
    console.error('[Genre Fetch Error]', error)
    return NextResponse.json({ genres: [] }, { status: 500 })
  }
}
