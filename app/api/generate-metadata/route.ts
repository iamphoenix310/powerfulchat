import { NextRequest, NextResponse } from 'next/server'
import { generateImageMetadata } from '@/app/lib/ai/generateImageMetadata'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })
    }

    const metadata = await generateImageMetadata(imageUrl)
    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Metadata generation error:', error)
    return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 })
  }
}
