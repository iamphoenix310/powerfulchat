'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'


interface Track {
  _id: string
  title: string
  slug?: { current: string }
}

export default function LyricsUploader() {
  const [songs, setSongs] = useState<Track[]>([])
  const [selectedSongId, setSelectedSongId] = useState<string>('')
  const [rawInput, setRawInput] = useState('')

  useEffect(() => {
    const fetchSongs = async () => {
      const res = await fetch('/api/music/all-tracks') // Create this API route
      const data = await res.json()
      setSongs(data)
    }

    fetchSongs()
  }, [])

  const handleSubmit = async () => {
    const lines = rawInput.trim().split('\n')

    const lyrics = lines.map((line) => {
      const match = line.match(/^(\d+):(\d+)\s+(.+)/)
      if (!match) return null

      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const text = match[3].trim()

      return {
        _key: uuidv4(), 
        time: minutes * 60 + seconds,
        line: text,
      }
    }).filter(Boolean)

    const res = await fetch('/api/music/upload-lyrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId: selectedSongId, lyrics }),
    })

    if (res.ok) {
      toast.success('Lyrics uploaded successfully!')
      setRawInput('')
    } else {
      toast.error('Upload failed')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Upload Synced Lyrics</h2>

      <select
        value={selectedSongId}
        onChange={(e) => setSelectedSongId(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">Select a song</option>
        {songs.map((song) => (
          <option key={song._id} value={song._id}>
            {song.title}
          </option>
        ))}
      </select>

      <textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        rows={10}
        className="w-full border p-2 rounded text-sm"
        placeholder="Format: 0:05 First line\n0:12 Second line..."
      />
      <button
        onClick={handleSubmit}
        disabled={!selectedSongId}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        Upload Lyrics
      </button>
    </div>
  )
}
