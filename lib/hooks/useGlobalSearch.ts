"use client"

import { useEffect, useState } from 'react'
import { client } from '@/app/utils/sanityClient'

interface SearchResult {
  type: string
  title?: string
  slug?: { current: string }
  image?: any
  coverImage?: any
  mainimage?: any
  profileImage?: any
  mainImage?: any
  poster?: any
  _id: string
}

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setLoading(true)

      const result = await client.fetch(
        `[
          ...*[_type == "articles" && title match $q]{ _id, title, slug, mainImage, "type": "article" },
          ...*[_type == "images" && title match $q]{ _id, title, slug, image, "type": "image" },
          ...*[_type == "musicTrack" && title match $q]{ _id, title, slug, coverImage, "type": "music" },
          ...*[_type == "feedPost" && content match $q]{ _id, "title": content, "type": "feed" },
          ...*[_type == "facesCelebs" && name match $q]{ _id, slug, image, name, "title": name, "type": "person" },
          ...*[_type == "products" && title match $q]{ _id, title, slug, mainimage, "type": "product" },
          ...*[_type == "user" && name match $q]{ _id, name, slug, profileImage, "title": name, "type": "user" },
          ...*[_type == "films" && title match $q]{ _id, title, slug, poster, "type": "movie" }
        ]`,
        { q: `*${query}*` }
      )

      setResults(result)
      setLoading(false)
    }

    fetchResults()
  }, [query])

  return { results, loading }
}
