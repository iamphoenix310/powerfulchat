// utils/createImageGeneration.ts
import { client } from './sanityClient'

interface Params {
  prompt: string
  userId: string
  imageAssetId: string
  aspectRatio: string
  model?: string
}

export const createImageGeneration = async ({
  prompt,
  userId,
  imageAssetId,
  aspectRatio,
  model = 'Flux.1-dev',
}: Params) => {
  const doc = {
    _type: 'imageGeneration',
    prompt,
    user: {
      _type: 'reference',
      _ref: userId,
    },
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: imageAssetId,
      },
    },
    aspectRatio,
    model,
    promptOptimized: false,
    status: 'draft',
    createdAt: new Date().toISOString(),
  }

  return await client.create(doc)
}
