'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function MissingInfoButton({ tmdbId }: { tmdbId: number }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  }, [status, session])

  // Always show button to admin
  if (status === 'loading') return null
  if (!session?.user || session.user.role !== 'admin') return null

  const handleFetch = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/fetch-movie-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId }),
    })
    setLoading(false)

    if (res.ok) {
      alert('✅ Movie info updated from TMDB')
      router.refresh()
    } else {
      alert('❌ Failed to update')
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleFetch}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Updating...' : 'Update Movie Info from TMDB'}
      </button>
    </div>
  )
}
