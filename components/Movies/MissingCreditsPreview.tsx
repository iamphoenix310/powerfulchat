'use client'

import { useEffect, useState } from 'react'
import { client } from '@/app/utils/sanityClient'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MissingCreditsPreview() {
  const [missing, setMissing] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMissing = async () => {
      const result = await client.fetch<string[]>(
        `*[_type == "missingCredits"]{ tmdbId }[0...100]`
      )
      setMissing(result.map((item: any) => item.tmdbId))
      setLoading(false)
    }
    fetchMissing()
  }, [])

  if (loading) return <p className="text-center text-sm text-zinc-500">Loading missing credits…</p>

  return (
    <div className="p-4 border rounded shadow bg-white dark:bg-zinc-900">
      <h2 className="text-lg font-semibold mb-3">🎬 Celebs with Missing Movie Links</h2>
      {missing.length === 0 ? (
        <p className="text-sm text-green-600">✅ All imported celebrities have linked films.</p>
      ) : (
        <ul className="space-y-2">
          {missing.map((id) => (
            <li key={id}>
              <Link href={`/add-celebs-here?ids=${id}`} className="text-blue-600 underline text-sm">
                Import missing TMDB ID: {id}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
