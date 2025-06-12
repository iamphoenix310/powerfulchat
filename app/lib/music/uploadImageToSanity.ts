import { client } from '@/app/utils/sanityClient'

export async function uploadImageToSanity(file: File): Promise<any> {
  const buffer = await file.arrayBuffer()
  const blob = new Blob([buffer], { type: file.type })

  const asset = await client.assets.upload('image', blob, {
    filename: file.name,
    contentType: file.type,
  })

  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: asset._id,
    },
  }
}
