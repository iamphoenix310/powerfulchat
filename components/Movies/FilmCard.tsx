"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Play, Info, Star, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { urlFor } from "@/app/utils/sanityClient"
import type { Film } from "@/types/film"

interface FilmCardProps {
  film: Film
  showTrailerButton?: boolean
}

export default function FilmCard({ film, showTrailerButton = true }: FilmCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="transition-transform"
    >
      <Card className="w-full h-full overflow-hidden rounded-2xl border border-border/20 shadow-md hover:shadow-lg bg-background transition-shadow">
        <Link href={`/movies/${film.slug.current}`} className="block relative group">
          <div className="relative aspect-[2/3] overflow-hidden rounded-t-2xl">
            {film.poster?.asset ? (
              <Image
                src={urlFor(film.poster) || "/placeholder.svg"}
                alt={film.title}
                width={600}
                height={900}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                No poster
              </div>
            )}

            {/* Rating */}
            {film.voteAverage !== undefined && (
              <div className="absolute top-3 right-3 bg-black/70 text-amber-400 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {film.voteAverage.toFixed(1)}
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </Link>

        <CardContent className="p-4 space-y-3">
          <Link href={`/movies/${film.slug.current}`}>
            <h3 className="font-semibold text-base text-foreground line-clamp-1 hover:text-primary transition-colors">
              {film.title}
            </h3>
          </Link>

          <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
            {film.releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(film.releaseDate).getFullYear()}
              </div>
            )}
            {film.runtime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {film.runtime} min
              </div>
            )}
          </div>

          {Array.isArray(film.genres) && film.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {film.genres.slice(0, 2).map((genre, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground font-medium"
                >
                  {genre}
                </span>
              ))}
              {film.genres.length > 2 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground font-medium">
                  +{film.genres.length - 2}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 w-full">
              <Link href={`/movies/${film.slug.current}`} className="flex-1 min-w-[120px]">
                <button className="w-full flex items-center justify-center gap-1 rounded border px-3 py-1 text-sm font-medium">
                  <Info className="w-4 h-4" />
                  Details
                </button>
              </Link>

              {film.trailerUrl && (
                <a
                  href={film.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px]"
                >
                  <button className="w-full flex items-center justify-center gap-1 rounded bg-black text-white px-3 py-1 text-sm font-medium">
                    <Play className="w-4 h-4" />
                    Trailer
                  </button>
                </a>
              )}
            </div>

        </CardContent>
      </Card>
    </motion.div>
  )
}
