'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { urlFor } from '@/app/utils/sanityClient'
import Image from 'next/image'

export default function DeleteFilmsPage() {
  const [films, setFilms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchFilms = async () => {
      const res = await fetch('/api/movies/delete-films') // ✅ same route for GET
      const data = await res.json()
      setFilms(data)
    }

    fetchFilms()
  }, [])

  const deleteFilm = async (id: string) => {
    setDeleting(id)
    const res = await fetch('/api/movies/delete-films', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }) // ✅ single delete
    })
    const result = await res.json()
    if (result.success) {
      setFilms((prev) => prev.filter((f) => f._id !== id))
    }
    setDeleting(null)
  }

  const deleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL films?')) return
    setLoading(true)
    const res = await fetch('/api/movies/delete-films', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleteAll: true }) // ✅ delete all
    })
    const result = await res.json()
    if (result.success) setFilms([])
    setLoading(false)
  }

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🗑 Delete Films</h1>

      <Button variant="destructive" onClick={deleteAll} disabled={loading}>
        {loading ? 'Deleting All…' : 'Delete All Films'}
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {films.map((film) => (
          <div
            key={film._id}
            className="border rounded-lg overflow-hidden shadow bg-white dark:bg-zinc-900"
          >
            {film.poster?.asset && (
              <Image
                src={urlFor(film.poster)}
                alt={film.title}
                width={400}
                height={600}
                className="w-full h-auto object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold">{film.title}</h2>
              <p className="text-xs text-zinc-500">{film.releaseDate}</p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-2"
                onClick={() => deleteFilm(film._id)}
                disabled={deleting === film._id}
              >
                {deleting === film._id ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
