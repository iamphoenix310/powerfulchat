// utils/uploadImageToSanity.ts
import { client } from './sanityClient'

export const uploadImageFromBlob = async (blob: Blob) => {
  const file = new File([blob], `generated-${Date.now()}.png`, { type: 'image/png' })

  const asset = await client.assets.upload('image', file, {
    contentType: 'image/png',
    filename: file.name,
  })

  return asset
}
