'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Props {
  title: string
  artist?: string
  description?: string
  coverImageUrl?: string
  r2Key: string
}

export default function MusicPlayer({ title, artist, description, coverImageUrl, r2Key }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const keyOnly = r2Key.replace(`${process.env.CLOUDFLARE_R2_BASE_URL}/`, '')
        const res = await fetch(`/api/r2-music-download?key=${encodeURIComponent(keyOnly)}`)

        const data = await res.json()
        console.log('Signed URL:', data)
        if (data?.signedUrl) {
          setAudioUrl(data.signedUrl)
        } else {
          console.error('Signed URL missing')
        }
      } catch (err) {
        console.error('Error fetching signed URL:', err)
      }
    }
  
    fetchSignedUrl()
  }, [r2Key])
  

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-xl shadow">
      {coverImageUrl && (
        <Image
          src={coverImageUrl}
          alt={title}
          width={400}
          height={400}
          className="w-full rounded-lg shadow"
        />
      )}

      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {artist && <p className="text-gray-600 text-sm">By {artist}</p>}
        {description && <p className="mt-2 text-gray-700">{description}</p>}
      </div>
      {audioUrl ? (
  <div className="mt-4">
    <audio
      src={audioUrl}
      controls
      className="w-full h-12 rounded-lg bg-gray-100 text-black focus:outline-none"
      style={{ accentColor: '#000' }} // optional color customization
    />
  </div>
) : (
  <p className="text-sm text-gray-500">Loading audio...</p>
)}

    </div>
  )
}
