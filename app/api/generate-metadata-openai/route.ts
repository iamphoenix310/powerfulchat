// app/api/generate-metadata-openai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json()

    if (!description) {
      return NextResponse.json({ error: 'Missing description' }, { status: 400 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // ✅ load inside the API, not globally
    })

    const prompt = `
You are a metadata assistant for an image-sharing platform.

Given a short user description about an image, generate a well-structured JSON object for image metadata, following this format:

{
  "title": "[Creative title, 4-5 words]",
  "description": "[Smart, elegant description in 1–2 sentences]",
  "tags": [array of 5 to 10 lowercase keywords, NO hashtags],
  "altText": "[Visual description for screen readers]",
  "prompt": "[Highly detailed, vivid, creative image prompt for AI image generation]"
}

Be very professional, no extra text.

User Description: "${description}"
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 500,
    })

    const text = response.choices[0]?.message?.content || ''

    try {
      const metadata = JSON.parse(text)
      return NextResponse.json({
        title: metadata.title || '',
        description: metadata.description || '',
        tags: Array.isArray(metadata.tags) ? metadata.tags : [],
        altText: metadata.altText || '',
        prompt: metadata.prompt || '',
      })
    } catch (err) {
      console.error('❌ Failed to parse OpenAI response as JSON:', text)
      return NextResponse.json({ error: 'Invalid OpenAI response format' }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Metadata generation error:', error)
    return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 })
  }
}
