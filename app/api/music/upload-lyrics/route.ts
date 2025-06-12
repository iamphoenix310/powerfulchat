// app/api/upload-lyrics/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
    const { songId, lyrics } = await req.json()
  
    if (!songId || !Array.isArray(lyrics)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
  
    try {
      await client
        .patch(songId)
        .setIfMissing({ lyrics: [] }) // 👈 ensure field exists
        .set({ lyrics })              // 👈 overwrite lyrics
        .commit()
  
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Sanity update failed' }, { status: 500 })
    }
  }
  