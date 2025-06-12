// app/api/admin/update-celebrity-biography/route.ts

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { processCelebrityData } from '@/scripts/forPeople/processCelebData'

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions })
  if (!session || session.user?.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 })
  }

  const { tmdbId } = await req.json()
  if (!tmdbId) return new Response('Invalid TMDB ID', { status: 400 })

  try {
    await processCelebrityData(tmdbId, { importBio: true, importMoviesOnly: false })
    return new Response('OK')
  } catch (err) {
    console.error('❌ Biography Update Error:', err)
    return new Response('Server error', { status: 500 })
  }
}
