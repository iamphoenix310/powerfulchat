'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CelebrityAdminTools({ tmdbId }: { tmdbId: string }) {
  const { data: session } = useSession()
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [loadingBio, setLoadingBio] = useState(false)
  const router = useRouter()

  if (!session?.user || session.user.role !== 'admin') return null

  const handleBasicInfo = async () => {
    setLoadingInfo(true)
    const res = await fetch('/api/admin/update-celebrity-basic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId }),
    })
    setLoadingInfo(false)
    if (res.ok) {
      alert('✅ Basic info updated.')
      router.refresh()
    } else {
      alert('❌ Failed to update basic info.')
    }
  }

  const handleBiography = async () => {
    setLoadingBio(true)
    const res = await fetch('/api/admin/update-celebrity-biography', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId }),
    })
    setLoadingBio(false)
    if (res.ok) {
      alert('✅ Biography updated.')
      router.refresh()
    } else {
      alert('❌ Failed to update biography.')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      <button
        onClick={handleBasicInfo}
        disabled={loadingInfo}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {loadingInfo ? 'Updating...' : 'Update Basic Info'}
      </button>
      <button
        onClick={handleBiography}
        disabled={loadingBio}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        {loadingBio ? 'Generating Bio...' : 'Generate Expanded Bio'}
      </button>
    </div>
  )
}
