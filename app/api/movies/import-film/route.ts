import { NextResponse } from 'next/server'
import { importFilmFromTmdb } from '@/scripts/movies/importFilmFromTmdb'

export async function POST(req: Request) {
  const { tmdbId } = await req.json()

  if (!tmdbId) {
    return NextResponse.json({ error: 'TMDB ID required' }, { status: 400 })
  }

  try {
    const { title, missingCelebs } = await importFilmFromTmdb(tmdbId)

    return NextResponse.json({
      success: true,
      tmdbId,
      title,
      missingCelebs,
    })
  } catch (err) {
    console.error('Failed to import film:', err)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
