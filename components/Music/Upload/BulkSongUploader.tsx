'use client'

import UploadSongForm from './UploadSongForm'
import { useState } from 'react'

export default function BulkSongUploader({ albumId, songCount }: { albumId: string; songCount: number }) {
  const [completed, setCompleted] = useState<number[]>([])

  const handleDone = (index: number) => {
    setCompleted((prev) => [...prev, index])
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold">📦 Uploading {songCount} Songs to Album</h3>

      {Array.from({ length: songCount }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg shadow bg-gray-50">
          <h4 className="font-semibold mb-2">🎵 Song {i + 1}</h4>
          <UploadSongForm
            albumId={albumId}
            onUpload={() => handleDone(i)}
            showProgress
            disabled={completed.includes(i)}
          />
        </div>
      ))}
    </div>
  )
}
