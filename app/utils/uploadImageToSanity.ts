// utils/uploadImageToSanity.ts
import { client } from './sanityClient'

export const uploadImageFromURL = async (imageUrl: string) => {
  const response = await fetch(imageUrl)

  if (!response.ok) throw new Error('Failed to fetch image from URL')

  const buffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const fileName = `replicate-${Date.now()}.jpg`

  const asset = await client.assets.upload('image', Buffer.from(buffer), {
    contentType,
    filename: fileName,
  })

  return asset
}
