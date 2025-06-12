// app/lib/sanity/uploadAssetOnly.ts
'use server'

import { client } from '@/app/utils/sanityClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

const getMimeTypeFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Uploads a single image file to Sanity as an image asset.
 * Returns the uploaded asset object with `_id` you can use in a reference.
 */
export async function uploadAssetOnly(file: File) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    throw new Error("Unauthorized: No session found")
  }

  const buffer = await file.arrayBuffer()
  const contentType = file.type || getMimeTypeFromExtension(file.name)

  const asset = await client.assets.upload('image', Buffer.from(buffer), {
    filename: file.name,
    contentType,
  })

  if (!asset?._id) {
    throw new Error("Sanity asset upload failed")
  }

  return asset // includes _id, url, etc.
}
