// lib/hooks/useGeneratedImages.ts
import useSWR from 'swr'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type GeneratedImage = {
  status: string
  _id: string
  image?: SanityImageSource
  imageUrl?: string
  prompt: string
  aspectRatio?: string
  promptOptimized?: boolean
}

export function useGeneratedImages() {
  const { data, error, isLoading, mutate } = useSWR('/api/user/generated', fetcher)

  const normalizedImages: GeneratedImage[] = (data?.images || []).map((img: any) => ({
    ...img,
    image: img.image || undefined,
    imageUrl: img.imageUrl || undefined,
  }))

  return {
    images: normalizedImages,
    isLoading,
    error,
    mutate,
  }
}
