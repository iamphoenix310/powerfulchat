'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { client } from '@/app/utils/sanityClient'
import { toast } from 'react-hot-toast'

interface Track {
  _id: string
  title: string
  wavFileUrl?: string
  r2FileUrlmp3?: string
}

export default function ConvertToMp3() {
  const { data: session, status } = useSession()
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedTrack = tracks.find((t) => t._id === selectedId)

  useEffect(() => {
    if (status === 'authenticated' && session.user?.role === 'admin') {
      const fetchTracks = async () => {
        const res = await client.fetch(
          `*[_type == "musicTrack" && defined(r2FileUrl) && !defined(r2FileUrlmp3)]{_id, title, "wavFileUrl": r2FileUrl, r2FileUrlmp3}`
        )
        setTracks(res)
      }

      fetchTracks()
    }
  }, [status, session])

  const handleConvert = async () => {
    if (!selectedTrack?.wavFileUrl) {
      toast.error('No track selected or WAV URL missing')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/music/convert-to-mp3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedTrack._id,
          wavFileUrl: selectedTrack.wavFileUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Conversion failed')

      toast.success('MP3 conversion complete ✅')
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <p className="text-center py-8 text-gray-500">Checking access...</p>
  }

  if (status !== 'authenticated' || session.user?.role !== 'admin') {
    return <p className="text-center py-8 text-red-600 font-medium">Access denied. Admins only.</p>
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Convert Uploaded WAV Song to MP3</h2>

      <select
        className="w-full border border-gray-300 rounded px-4 py-2"
        value={selectedId || ''}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="" disabled>Select a track...</option>
        {tracks.map((track) => (
          <option key={track._id} value={track._id}>
            {track.title}
          </option>
        ))}
      </select>

      {selectedTrack && (
        <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
          <p><strong>WAV URL:</strong></p>
          <p className="break-all">{selectedTrack.wavFileUrl}</p>
        </div>
      )}

      <button
        disabled={loading || !selectedTrack}
        onClick={handleConvert}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 disabled:opacity-50"
      >
        {loading ? 'Converting...' : 'Convert to MP3'}
      </button>
    </div>
  )
}
