"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Heart, Eye, Smile, Crown, Sparkles } from "lucide-react"

interface Person {
  _id: string
  name: string
  slug: { current: string }
  image: any
  profession: string[]
  facerating?: number
  eyesrating?: number
  lipsrating?: number
  numberofratings?: number
  country?: string
}

export default function TopRatedByLooks() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(`*[_type == "facesCelebs" && (defined(facerating) || defined(eyesrating) || defined(lipsrating))] {
        _id, name, slug, image, profession, country,
        facerating, eyesrating, lipsrating, numberofratings,
        "avgLooks": (coalesce(facerating, 0) + coalesce(eyesrating, 0) + coalesce(lipsrating, 0)) / 3
      } | order(avgLooks desc)[0...10]`)
      .then((data) => {
        setPeople(data)
        setLoading(false)
      })
  }, [])

  const calculateLooksRating = (person: Person) => {
    const ratings = [person.facerating, person.eyesrating, person.lipsrating].filter((r): r is number => typeof r === "number" && r > 0)
    return ratings.length > 0 ? Math.round(ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length) : 0
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl aspect-[4/5] mb-3"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-3 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {people.map((person, index) => {
        const looksRating = calculateLooksRating(person)

        return (
          <Link
            key={person._id}
            href={`/people/${person.slug.current}`}
            className="group block relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-br from-pink-50 to-rose-100 border border-pink-200"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-3xl">
              <Image
                src={urlFor(person.image) || "/placeholder.svg"}
                alt={person.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Ranking badge */}
              {index < 3 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-2 rounded-full shadow-lg">
                  {index === 0 && <Crown className="h-5 w-5" />}
                  {index === 1 && <Sparkles className="h-5 w-5" />}
                  {index === 2 && <Heart className="h-5 w-5 fill-current" />}
                </div>
              )}

              {/* Rating overlay */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500 fill-current" />
                  <span className="font-bold text-gray-800">{looksRating}</span>
                </div>
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300">
                {person.name}
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {person.profession?.slice(0, 2).map((prof, idx) => (
                  <span key={idx} className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full font-medium">
                    {prof}
                  </span>
                ))}
              </div>

              {/* Individual ratings */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {person.facerating && (
                  <div className="text-center">
                    <div className="bg-pink-50 p-2 rounded-lg mb-1">
                      <Smile className="h-4 w-4 text-pink-500 mx-auto" />
                    </div>
                    <span className="text-xs text-gray-600">Face</span>
                    <div className="font-bold text-pink-600">{person.facerating}</div>
                  </div>
                )}
                {person.eyesrating && (
                  <div className="text-center">
                    <div className="bg-blue-50 p-2 rounded-lg mb-1">
                      <Eye className="h-4 w-4 text-blue-500 mx-auto" />
                    </div>
                    <span className="text-xs text-gray-600">Eyes</span>
                    <div className="font-bold text-blue-600">{person.eyesrating}</div>
                  </div>
                )}
                {person.lipsrating && (
                  <div className="text-center">
                    <div className="bg-rose-50 p-2 rounded-lg mb-1">
                      <Heart className="h-4 w-4 text-rose-500 mx-auto fill-current" />
                    </div>
                    <span className="text-xs text-gray-600">Lips</span>
                    <div className="font-bold text-rose-600">{person.lipsrating}</div>
                  </div>
                )}
              </div>

              {/* Rating count */}
              {person.numberofratings && (
                <div className="text-center text-xs text-gray-500">
                  Rated by {person.numberofratings} {person.numberofratings === 1 ? "person" : "people"}
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
