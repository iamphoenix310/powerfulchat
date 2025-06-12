'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { uploadImageToSanity } from '@/app/lib/music/uploadImageToSanity'

export default function UploadAlbumForm({ onAlbumCreated }: { onAlbumCreated: (albumId: string) => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lyricist, setLyricist] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAlbumUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !coverImage) return toast.error('Please enter title and select cover image')

    try {
      setLoading(true)
      const cover = await uploadImageToSanity(coverImage)

      const res = await fetch('/api/music/create-album', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          lyricist,
          coverImage: cover,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Album created!')
        onAlbumCreated(data.id)
      } else {
        toast.error('Failed to create album')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error creating album')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleAlbumUpload} className="p-6 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold text-center">🎶 Create New Album</h2>

      <input
        type="text"
        placeholder="Album Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <textarea
        placeholder="Album Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="text"
        placeholder="Lyricist (optional)"
        value={lyricist}
        onChange={(e) => setLyricist(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <label className="block">
        Album Cover:
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
          className="mt-1"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Creating Album...' : 'Create Album'}
      </button>
    </form>
  )
}
