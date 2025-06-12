"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Button } from "@/components/ui/button"

interface Film {
  _id: string
  title: string
  slug: { current: string }
  poster: any
  releaseDate?: string
}

export default function MovieShowcase() {
  const [films, setFilms] = useState<Film[]>([])

  useEffect(() => {
    const fetchFilms = async () => {
      const query = `*[_type == "films" && defined(poster)] | order(_createdAt desc)[0...4] {
        _id,
        title,
        slug,
        poster,
        releaseDate
      }`
      const result = await client.fetch(query)
      setFilms(result)
    }

    fetchFilms()
  }, [])

  return (
    <section className="w-full bg-black text-white py-20">
      <div className="px-4 max-w-6xl mx-auto text-center space-y-10">
        <h2 className="text-3xl md:text-4xl font-bold">
          Trending Movies
        </h2>
        <p className="text-white/80 max-w-xl mx-auto text-base">
          Watch trailers, rate actors, explore stories — check out the newest and top-rated movies.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {films.map((film) => (
            <Link
              key={film._id}
              href={`/movies/${film.slug.current}`}
              className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md border border-white/10 bg-white/5 hover:scale-105 transition-transform duration-300"
            >
              <Image
                src={urlFor(film.poster)}
                alt={film.title}
                fill
                className="object-cover"
              />
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/movies">
            <Button size="lg" className="px-6 py-3 text-base font-medium">
              Explore Movies
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
