"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { client, urlFor } from "@/app/utils/sanityClient"
import Image from "next/image"
import { Play, Music, Disc, Clock } from "lucide-react"

export default function MusicTeaser() {
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(`*[_type == "musicTrack"] | order(_createdAt desc)[0...12]{
      _id,
      title,
      slug,
      coverImage,
      isSingle,
      duration,
      artist,
      album->{slug, title}
    }`)
      .then((data) => {
        setTracks(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="bg-gray-200 rounded-lg w-12 h-12 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="bg-gray-200 h-3 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tracks.map((track, index) => {
        const href =
          track.isSingle || !track.album?.slug?.current
            ? `/music/singles/${track.slug.current}`
            : `/music/albums/${track.album.slug.current}/${track.slug.current}`

        return (
          <Link key={track._id} href={href}>
            <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-200">
              <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={urlFor(track.coverImage, { width: 100, height: 100 })}
                  alt={track.title}
                  fill
                  className="object-cover"
                />

                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="h-4 w-4 text-white fill-current" />
                </div>

                {/* Track number for featured tracks */}
                {index < 2 && (
                  <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-pink-600 transition-colors duration-300 line-clamp-1">
                  {track.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    {track.isSingle ? <Music className="h-3 w-3" /> : <Disc className="h-3 w-3" />}
                    <span>{track.isSingle ? "Single" : track.album?.title}</span>
                  </div>

                  {track.duration && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{track.duration}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
