"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { urlFor } from "@/app/utils/sanityClient"
import type { Film } from "@/types/film"
import { Play, Info, Star, Clock, Calendar, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface FilmRowCardProps {
  film: Film
  showTrailerButton?: boolean
}

export default function FilmRowCard({ film, showTrailerButton = true }: FilmRowCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      <Card className="flex flex-col w-full bg-gradient-conic from-card via-background to-card shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border-border/30">
        <div className="relative w-full h-48 sm:h-auto md:w-36 lg:w-48 overflow-hidden">
          {film.poster?.asset ? (
            <Image
              src={urlFor(film.poster) || "/placeholder.svg"}
              alt={film.title}
              width={300}
              height={450}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full min-h-[150px] bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No poster</span>
            </div>
          )}

          {/* Rating badge */}
          {film.voteAverage !== undefined && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-amber-400 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span>{film.voteAverage.toFixed(1)}</span>
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-5 flex flex-col justify-between flex-1">
          <div className="space-y-2 sm:space-y-3">
            <Link href={`/movies/${film.slug.current}`}>
              <h3 className="text-base sm:text-xl font-bold text-foreground hover:text-primary transition-colors">
                {film.title}
              </h3>
            </Link>

            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              {film.releaseDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{new Date(film.releaseDate).getFullYear()}</span>
                </div>
              )}

              {film.runtime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{film.runtime} min</span>
                </div>
              )}

              {film.voteCount !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] sm:text-xs text-muted-foreground/70">
                    ({film.voteCount.toLocaleString()} votes)
                  </span>
                </div>
              )}
            </div>

            {Array.isArray(film.genres) && film.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {film.genres.slice(0, 3).map((genre, i) => (
                  <span
                    key={i}
                    className="px-1.5 sm:px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px] sm:text-xs font-medium"
                  >
                    {genre}
                  </span>
                ))}
                {film.genres.length > 3 && (
                  <span className="px-1.5 sm:px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px] sm:text-xs font-medium">
                    +{film.genres.length - 3}
                  </span>
                )}
              </div>
            )}

            {film.description && (
              <p className="text-xs sm:text-sm text-foreground/80 line-clamp-2 mt-1 sm:mt-2">{film.description}</p>
            )}

            {/* {film.imdbId && (
              <a
                href={`https://www.imdb.com/title/${film.imdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-600 hover:text-amber-500 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                IMDb Page
              </a>
            )} */}
          </div>

          <div className="mt-3 sm:mt-4 flex gap-2">
            <Link href={`/movies/${film.slug.current}`}>
              <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
                <Info className="w-3.5 h-3.5" />
                Details
              </Button>
            </Link>

            {showTrailerButton && film.trailerUrl && (
              <a href={film.trailerUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1 text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Trailer
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
