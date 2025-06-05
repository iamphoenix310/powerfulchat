import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const data = await req.formData()
  const file = data.get('file') as Blob

  // Pass the Blob directly to the OpenAI SDK
  const response = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
  })

  return NextResponse.json({ text: response.text })
}
