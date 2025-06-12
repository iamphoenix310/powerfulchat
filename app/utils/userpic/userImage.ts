// utils/uploadToSanity.ts
import { client } from '@/app/utils/sanityClient'

export async function uploadProfileImageToSanity(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())

  const asset = await client.assets.upload('image', buffer, {
    filename: file.name,
    contentType: file.type,
  })

  return asset.url
}
