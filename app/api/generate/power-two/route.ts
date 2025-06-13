// File: src/app/api/generate/powertwo/route.ts
import { NextResponse } from 'next/server'
import OpenAI, { toFile } from 'openai'


export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const {
      prompt,
      type, // "generate" or "edit"
      size = '1024x1024',
      quality = 'high',
      format = 'png', // "jpeg" | "webp" | "png"
      background = 'auto',
      n = 2,
      imageFile,     // base64 string if editing
      imageMimeType, // mime type if editing
      maskFile,      // base64 string if inpainting (optional)
      maskMimeType,  // mime type if mask provided
    } = await req.json()

    let response

    if (type === 'edit') {
      if (!imageFile || !imageMimeType) {
        return NextResponse.json({ error: 'Image file and mime type are required for editing.' }, { status: 400 })
      }

      response = await openai.images.edit({
        model: "gpt-image-1",
        image: await toFile(Buffer.from(imageFile, 'base64'), "image", { type: imageMimeType }),
        mask: maskFile ? await toFile(Buffer.from(maskFile, 'base64'), "mask", { type: maskMimeType || "image/png" }) : undefined,
        prompt,
        n,
        size,
        ...(quality && { quality }),
        ...(background && { background }),
        ...(format && { output_format: format }),
      } as any)

    } else {
      // Normal Generate
      response = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        n,
        size,
        ...(quality && { quality }),
        ...(background && { background }),
        ...(format && { output_format: format }),
      } as any)
    }

    const images = (response.data ?? []).map((img: any) =>
      img.url ? img.url : `data:image/png;base64,${img.b64_json}`
    )

    return NextResponse.json({ images })

  } catch (error: any) {
    console.error('❌ OpenAI Image Generation Error:', error)
    return NextResponse.json({ error: 'Image generation failed.' }, { status: 500 })
  }
}
