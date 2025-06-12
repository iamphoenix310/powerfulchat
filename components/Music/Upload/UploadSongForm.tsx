'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { uploadImageToSanity } from '@/app/lib/music/uploadImageToSanity'
import { uploadToR2 } from '@/app/lib/r2/uploadToR2'
import { v4 as uuidv4 } from 'uuid'


interface Props {
    albumId?: string
    onUpload?: () => void
    showProgress?: boolean
    disabled?: boolean
  }
  

  export default function UploadSongForm({ albumId, onUpload, showProgress, disabled }: Props) {

  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [singer, setSinger] = useState('')
  const [lyricist, setLyricist] = useState('')
  const [composer, setComposer] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [availableGenres, setAvailableGenres] = useState<{ _id: string; name: string }[]>([])
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [wavFile, setWavFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch('/api/music/genres')
        const data = await res.json()
        setAvailableGenres(data.genres)
      } catch (err) {
        console.error('Failed to load genres', err)
      }
    }

    fetchGenres()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !wavFile) return toast.error('Song title and WAV file are required')

    try {
      setLoading(true)

      const cover = coverImage ? await uploadImageToSanity(coverImage) : null
      const r2Url = await uploadToR2(wavFile)

      const res = await fetch('/api/music/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          lyricist,
          singer,
          composer,
          genre: genres.map((id) => ({
            _type: 'reference',
            _ref: id,
            _key: uuidv4(),
          })),
          coverImage: cover,
          r2FileUrl: r2Url,
          albumId,
          isSingle: !albumId,
          artistUser: session?.user?.id || null,
        }),
      })

      if (res.ok) {
        toast.success('Song uploaded!')
        onUpload?.()
        setTitle('')
        setDescription('')
        setLyricist('')
        setSinger('')
        setComposer('')
        setGenres([])
        setCoverImage(null)
        setWavFile(null)
      } else {
        toast.error('Upload failed')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error uploading song')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`p-6 bg-white rounded-xl shadow space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>

      <h2 className="text-xl font-semibold text-center">
        {albumId ? '📥 Upload Song to Album' : '🎵 Upload Single Song'}
      </h2>

      <input type="text" placeholder="Song Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" required />

      <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" />

      <input type="text" placeholder="Lyricist" value={lyricist} onChange={(e) => setLyricist(e.target.value)} className="w-full border px-3 py-2 rounded" />
      <input type="text" placeholder="Singer" value={singer} onChange={(e) => setSinger(e.target.value)} className="w-full border px-3 py-2 rounded" />
      <input type="text" placeholder="Composer" value={composer} onChange={(e) => setComposer(e.target.value)} className="w-full border px-3 py-2 rounded" />

      <label className="block text-sm font-medium">Select Genres</label>
      <select
        multiple
        className="w-full border px-2 py-1 rounded"
        value={genres}
        onChange={(e) =>
          setGenres(Array.from(e.target.selectedOptions).map((opt) => opt.value))
        }
      >
        {availableGenres.map((genre) => (
          <option key={genre._id} value={genre._id}>
            {genre.name}
          </option>
        ))}
      </select>

      <label className="block">
        Track Cover (optional):
        <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} className="mt-1" />
      </label>

      <label className="block">
        WAV File:
        <input type="file" accept=".wav" onChange={(e) => setWavFile(e.target.files?.[0] || null)} className="mt-1" required />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload Song'}
      </button>
      {showProgress && !loading && (
        <p className="text-sm text-green-600 text-center mt-2">✔ Upload complete</p>
        )}

    </form>
  )
}
