// app/hooks/useGeneratedImages.ts
'use client'

import { useState, useEffect } from 'react'

export function useGeneratedImages(userId: string) {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchGeneratedImages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/images/generated-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      setImages(data.images || [])
    } catch (err) {
      console.error('Failed fetching generated images', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (userId) {
      fetchGeneratedImages()
    }
  }, [userId])

  return { images, loading, refetch: fetchGeneratedImages }
}
