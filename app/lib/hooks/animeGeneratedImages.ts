import { useEffect, useState } from "react"
import { client } from "@/app/utils/sanityClient"

interface ImageDoc {
  _id: string
  imageUrl: string
  prompt: string
  aspectRatio?: string
  model: string
  _createdAt?: string
  status?: "draft" | "published"
  user?: { _ref: string }
}

export function useAnimeGeneratedImages(userId: string) {
  const [images, setImages] = useState<ImageDoc[]>([])
  const [loading, setLoading] = useState(true)

  const fetchImages = async () => {
    try {
      setLoading(true)
      const result = await client.fetch(
        `*[_type == "imageGeneration" &&
           user._ref == $userId &&
           model == "openai" &&
           (prompt match "*ghibli*" || prompt match "*pixar*" || prompt match "*anime*")
        ] | order(_createdAt desc) {
          _id, model, prompt, _createdAt, status, aspectRatio,
          "imageUrl": image.asset->url,
          user
        }`,
        { userId }
      )
      setImages(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) fetchImages()
  }, [userId])

  return { images, loading, refetch: fetchImages }
}
