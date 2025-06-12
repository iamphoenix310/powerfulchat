// api/modal/images/generate-images/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt, model, aspect, style } = await req.json()

  try {
    const endpoint =
      model === 'hidream'
        ? 'https://powerful--hidream-fire-hidream-hi-dream.modal.run'
        : 'https://powerful--powergen-v1-fluxinference-generate.modal.run'

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, model, aspect, style }),
      cache: 'no-store', // 🔥 Prevent Vercel timeout (force fresh request)
    })

    if (!res.ok) {
      throw new Error(`Modal API error: ${res.statusText}`)
    }

    const data = await res.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Modal Gen Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
