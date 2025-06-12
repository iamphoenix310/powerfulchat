import { NextResponse } from 'next/server'
import Replicate from 'replicate'
import { client } from '@/app/utils/sanityClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { uploadImageFromURL } from '@/app/utils/uploadImageToSanity'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function POST(req: Request) {
  const { prompt, aspectRatio, prompt_upsampling, model = 'flux' } = await req.json()
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const startOfDay = new Date(now.setUTCHours(0, 0, 0, 0)).toISOString()
  
  const generationCountQuery = `
    count(*[_type == "imageGeneration" && user._ref == $userId && _createdAt >= $start])
  `
  
  const generationCount = await client.fetch(generationCountQuery, {
    userId: session.user.id,
    start: startOfDay,
  })
  
  const DAILY_LIMIT = 5
  const remaining = Math.max(0, DAILY_LIMIT - generationCount)
  
  if (generationCount >= DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: 'Daily generation limit reached (5 per day)',
        used: generationCount,
        remaining: 0,
      },
      { status: 429 }
    )
  }
  


  try {
    let selectedModel = ''
    let finalPrompt = prompt

    switch (model) {
      case 'flux':
        selectedModel = 'black-forest-labs/flux-1.1-pro'
        break
      case 'imagen':
        selectedModel = 'google/imagen-3-fast'
        break
      case 'imagen-ghibli':
        selectedModel = 'google/imagen-3-fast'
        finalPrompt = `In the style of Studio Ghibli, ${prompt}`
        break
      default:
        throw new Error('Invalid model selected')
    }

    const prediction = await replicate.predictions.create({
      model: selectedModel,
      input: {
        prompt: finalPrompt,
        aspect_ratio: aspectRatio || '1:1',
        output_format: 'jpg',
        output_quality: 80,
        test: true,
        safety_tolerance: 2,
        prompt_upsampling: false,
      }
    })

    // 🌀 Poll until done
    let output = null
    while (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed' &&
      prediction.status !== 'canceled'
    ) {
      await new Promise((res) => setTimeout(res, 1500))
      const latest = await replicate.predictions.get(prediction.id)
      output = latest.output
      prediction.status = latest.status
    }

    if (prediction.status !== 'succeeded') {
      throw new Error(`Replicate failed: ${prediction.status}`)
    }

    const imageUrl =
      typeof output === 'string'
        ? output
        : Array.isArray(output) && typeof output[0] === 'string'
        ? output[0]
        : null

    if (!imageUrl) {
      throw new Error('No valid image URL returned by Replicate')
    }

    const sanityAsset = await uploadImageFromURL(imageUrl)

    const doc = {
      _type: 'imageGeneration',
      prompt,
      finalPrompt,
      aspectRatio,
      promptOptimized: prompt_upsampling,
      model,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: sanityAsset._id,
        },
      },
      status: 'draft',
      user: {
        _type: 'reference',
        _ref: session.user.id,
      },
    }

    const created = await client.create(doc)

    return NextResponse.json({
      _id: created._id,
      image: doc.image,
      used: generationCount + 1,
      remaining: DAILY_LIMIT - (generationCount + 1),
    })
    
  } catch (err: any) {
    console.error('[API /generate ERROR]', err)
    return NextResponse.json({ error: err.message || 'Image generation failed' }, { status: 500 })
  }
}
