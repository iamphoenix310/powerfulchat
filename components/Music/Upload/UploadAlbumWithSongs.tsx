'use client'

import { useState } from 'react'
import UploadAlbumForm from './UploadAlbumForm'
import UploadSongForm from './UploadSongForm'
import BulkSongUploader from './BulkSongUploader'

export default function UploadAlbumWithSongs() {
  const [albumId, setAlbumId] = useState<string | null>(null)
  const [songCount, setSongCount] = useState(1)
  const [mode, setMode] = useState<'bulk' | 'manual'>('bulk')

  return (
    <div className="space-y-8">
      {!albumId ? (
        <>
          <UploadAlbumForm onAlbumCreated={(id) => setAlbumId(id)} />
          <div className="space-y-3">
            <label className="block font-medium">Number of Songs to Upload:</label>
            <input
              type="number"
              min={1}
              max={30}
              value={songCount}
              onChange={(e) => setSongCount(Number(e.target.value))}
              className="w-24 border px-2 py-1 rounded"
            />
            <div className="space-x-4">
              <label>
                <input
                  type="radio"
                  value="bulk"
                  checked={mode === 'bulk'}
                  onChange={() => setMode('bulk')}
                />{' '}
                Upload All at Once
              </label>
              <label>
                <input
                  type="radio"
                  value="manual"
                  checked={mode === 'manual'}
                  onChange={() => setMode('manual')}
                />{' '}
                Upload One by One
              </label>
            </div>
          </div>
        </>
      ) : mode === 'manual' ? (
        <UploadSongForm albumId={albumId} />
      ) : (
        <BulkSongUploader albumId={albumId} songCount={songCount} />
      )}
    </div>
  )
}
