import { createClient, SanityClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client: SanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'qwvo1z5j',
  dataset: 'production',
  apiVersion: '2024-03-07',
  useCdn: true,
  token: process.env.SANITY_TOKEN,
})

export const newsClient: SanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'qwvo1z5j',
  dataset: 'production',
  apiVersion: '2024-03-07',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
})


const builder = imageUrlBuilder(client)

/**
 * Generates optimized Sanity image URLs.
 *
 * @param source - The image source from Sanity.
 * @param options - Optional settings for width, height, crop, and high quality.
 */
export const urlFor = (
  source: any,
  options: {
    width?: number
    height?: number
    crop?: boolean
    highQuality?: boolean
  } = {}
): string => {
  if (!source || !source.asset) {
    return '/default-avatar.png'
  }

  let image = builder.image(source)

  // Apply transformations
  if (options.width) {
    image = image.width(options.width)
  }

  if (options.height) {
    image = image.height(options.height)
  }

  if (options.crop) {
    image = image.focalPoint(0.5, 0).fit('crop') // focus top center if cropped
  }

  // 🔥 Smart default quality (reduced unless highQuality)
  image = image.quality(options.highQuality ? 100 : 60).auto('format')

  return image.url()
}

/**
 * Converts a Sanity file asset `_ref` into a CDN-accessible URL.
 *
 * @param ref - The Sanity file asset reference.
 * @returns string - Full CDN file URL.
 */
export const getFileUrl = (ref: string): string => {
  if (!ref || !ref.startsWith('file-')) return ''
  const [, fileId, ext] = ref.split('-')
  return `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${fileId}.${ext}`
}
