import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export async function GET() {
  const tracks = await client.fetch(`*[_type == "musicTrack"]{ _id, title, slug }`)
  return NextResponse.json(tracks)
}
