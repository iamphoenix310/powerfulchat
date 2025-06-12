'use client'

import { useEffect, useState } from 'react'
import MusicCard from './MusicCard'

interface Props {
  type: 'album' | 'single'
}

export default function MusicGrid({ type }: Props) {
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const endpoint = type === 'album' ? '/api/music/albums' : '/api/music/singles'
        const res = await fetch(endpoint, { cache: 'no-store' })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load music')
        }

        const normalized = Array.isArray(data)
          ? data
          : type === 'album'
          ? data.albums || []
          : data.singles || []

        setItems(normalized)
        setError(null)
      } catch (err: any) {
        console.error('Error loading music:', err)
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [type])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-sm text-center">⚠️ {error}</div>
  }

  if (items.length === 0) {
    return <div className="text-gray-500 text-sm text-center">No {type}s found.</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {items.map((item) => (
        <MusicCard key={item._id} item={item} type={type} />
      ))}
    </div>
  )
}
