'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { uploadToR2 } from '@/app/lib/r2/uploadToR2'
import { uploadImageToSanity } from '@/app/lib/music/uploadImageToSanity'

export default function UploadMusicForm() {
  const { data: session, status } = useSession()

  // ✅ All hooks at the top
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [wavFile, setWavFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // ❌ Don't put hooks inside conditions — only return content conditionally
  if (status === 'loading') return <div className="p-4 text-center text-gray-500">Checking access...</div>
  if (!session?.user?.role || session.user.role !== 'admin') {
    return <p className="p-4 text-center text-sm text-red-500">Access denied: Admins only</p>
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coverImage || !wavFile) return toast.error('Please select both cover image and WAV file')

    try {
      setLoading(true)

      const coverAsset = await uploadImageToSanity(coverImage)
      const r2Url = await uploadToR2(wavFile)

      const res = await fetch('/api/music/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          artist,
          description,
          coverImage: coverAsset,
          r2FileUrl: r2Url,
        }),
      })

      if (res.ok) {
        toast.success('Track uploaded!')
        setTitle('')
        setArtist('')
        setDescription('')
        setCoverImage(null)
        setWavFile(null)
      } else {
        toast.error('Upload failed')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error uploading track')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-xl mx-auto space-y-5 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold text-center">🎵 Upload New Music Track</h2>

      <input
        type="text"
        placeholder="Track Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
        required
      />

      <input
        type="text"
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        className="w-full border px-3 py-2 rounded focus:outline-none"
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border px-3 py-2 rounded resize-none focus:outline-none"
      />

      <label className="block text-sm font-medium text-gray-700">
        Cover Image:
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
          className="mt-1"
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        WAV File:
        <input
          type="file"
          accept=".wav"
          onChange={(e) => setWavFile(e.target.files?.[0] || null)}
          className="mt-1"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload Track'}
      </button>
    </form>
  )
}
