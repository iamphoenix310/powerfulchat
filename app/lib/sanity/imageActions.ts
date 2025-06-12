'use server'

import { client } from '@/app/utils/sanityClient'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

const slugify = (str: string) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

// Fallback for iOS missing content type
function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'pdf':
      return 'application/pdf'
    case 'zip':
      return 'application/zip'
    default:
      return 'application/octet-stream'
  }
}

export async function uploadImageToSanity(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    throw new Error('User not authenticated or user ID missing in session.')
  }

  const file = formData.get('image') as File | null
  const imageUrl = formData.get('imageUrl') as string | null
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const altText = formData.get('altText') as string
  const categoryId = formData.get('category') as string
  const tags = (formData.get('tags') as string)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const generatedImageId = formData.get('generatedImageId') as string | null
  const prompt = formData.get('prompt') as string | null

  const isPremium = formData.get('isPremium') === 'true'
  const price = parseFloat(formData.get('price') as string) || 0
  const unlockAfterPurchase = formData.get('unlockAfterPurchase') === 'true'

  if ((!file && !imageUrl) || !title) {
    throw new Error('Missing required fields.')
  }

  // ✅ Upload image to Sanity
  let asset
  if (file) {
    const buffer = await file.arrayBuffer()
    asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: file.name,
      contentType: file.type?.length ? file.type : getMimeTypeFromExtension(file.name),
    })
  } else if (imageUrl) {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'image/*',
      },
    })
    if (!response.ok) {
      throw new Error(`Could not fetch image from external URL. Status: ${response.status}`)
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      throw new Error(`Fetched file is not a valid image. Got: ${contentType}`)
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    asset = await client.assets.upload('image', buffer, {
      filename: slugify(title) + '.jpg',
      contentType,
    })
  }

  if (!asset?._id) {
    throw new Error('Failed to upload image asset.')
  }

  // ✅ Handle attached R2 file metadata
  const attachedFilesRaw = formData.get('attachedFiles') as string | null
  const attachedFiles = attachedFilesRaw ? JSON.parse(attachedFilesRaw) : []

  const slug = slugify(title)
  const doc = {
    _type: 'images',
    _id: uuidv4(),
    title,
    slug: { _type: 'slug', current: slug },
    description,
    alt: altText,
    tags,
    prompt,
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    },
    category: {
      _type: 'reference',
      _ref: categoryId,
    },
    likes: 0,
    views: 0,
    downloads: 0,
    adRevenueGenerated: 0,
    isPremium,
    price: isPremium ? price : 0,
    unlockAfterPurchase: isPremium ? unlockAfterPurchase : false,
    attachedFiles: isPremium ? attachedFiles : [],
    creator: {
      _type: 'reference',
      _ref: session.user.id,
    },
    status: 'published',
  }

  const created = await client.create(doc)

  if (generatedImageId) {
    await client.patch(generatedImageId).set({ status: 'published' }).commit()
  }

  revalidatePath('/images')
  console.log('✅ Uploaded to Sanity and synced with R2. Slug:', slug)

  return {
    success: true,
    id: created._id,
    slug: created.slug?.current || '',
  }
}
