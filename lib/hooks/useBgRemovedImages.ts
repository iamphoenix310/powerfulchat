import { useEffect, useState } from 'react'
import { client } from '@/app/utils/sanityClient'

export type BgRemovedImage = {
  _id: string
  image: any
  originalFilename?: string
  processedAt?: string
}

export function useBgRemovedImages(userId?: string) {
  const [images, setImages] = useState<BgRemovedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setImages([])
      return
    }
    setLoading(true)
    client.fetch(
      `*[_type == "bgRemovedImage" && user._ref == $userId] | order(processedAt desc){_id, image, originalFilename, processedAt}`,
      { userId }
    )
    .then(setImages)
    .catch(e => setError(e.message || "Failed to load"))
    .finally(() => setLoading(false))
  }, [userId])

  return { images, loading, error }
}
