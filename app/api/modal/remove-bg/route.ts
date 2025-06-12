// app/api/remove-bg/route.ts
import { NextResponse } from 'next/server'
import { Readable } from 'stream'
import { Buffer } from 'buffer'

export const runtime = 'edge' // or 'nodejs' if you're using heavy packages

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    // 🛰️ Replace with your actual Modal deployed function URL
    const MODAL_API_URL = 'https://powerful--powerful-rembg-remover-remove-background.modal.run'

    const res = await fetch(MODAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Modal API failed' }, { status: 500 })
    }

    const outputBuffer = Buffer.from(await res.arrayBuffer())
    const base64 = outputBuffer.toString('base64')

    return NextResponse.json({
      imageBase64: `data:image/png;base64,${base64}`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
