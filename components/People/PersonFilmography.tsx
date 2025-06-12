'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/app/utils/sanityClient'
import { Film } from '@/types/film'
import { Button } from '@/components/ui/button'

interface FilmCredit {
  film: Film
  role?: string
}

interface PersonFilmographyProps {
  credits: FilmCredit[]
}

export default function PersonFilmography({ credits }: PersonFilmographyProps) {
  const validCredits = credits.filter(c => c.film?.slug?.current)
  const [showAll, setShowAll] = useState(false)

  if (!validCredits.length) return null

  const visibleCredits = showAll ? validCredits : validCredits.slice(0, 6)

  return (
    <section className="mt-12">
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-4">🎥 Filmography</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {visibleCredits.map((credit, idx) => (
          <Link href={`/movies/${credit.film.slug.current}`} key={idx}>
            <div className="bg-white rounded-md shadow-sm border border-slate-200 hover:shadow transition overflow-hidden">
              {credit.film.poster?.asset && (
                <div className="relative w-full aspect-[2/3]">
                  <Image
                    src={urlFor(credit.film.poster)}
                    alt={credit.film.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-slate-800 truncate">{credit.film.title}</p>
                {credit.role && (
                  <p className="text-[10px] text-slate-500 italic truncate">{credit.role}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {validCredits.length > 6 && !showAll && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setShowAll(true)}>
            Show More
          </Button>
        </div>
      )}
    </section>
  )
}
