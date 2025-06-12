"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { client, urlFor } from "@/app/utils/sanityClient"
import { TrendingUp, FlameIcon as Fire, Users, Star, Crown } from "lucide-react"

interface Person {
  _id: string
  name: string
  slug: { current: string }
  image: any
  profession: string[]
  powerMeter: number
  facerating?: number
  eyesrating?: number
  lipsrating?: number
  actingrating?: number
  voicerating?: number
  modellingrating?: number
  numberofratings?: number
  country?: string
}

export default function TrendingPeople() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get people with recent activity (high ratings + power meter)
    client
      .fetch(`*[_type == "facesCelebs" && defined(numberofratings) && numberofratings > 5] | order(powerMeter desc, numberofratings desc)[0...10]{
        _id, name, slug, image, profession, powerMeter, country,
        facerating, eyesrating, lipsrating, actingrating, voicerating, 
        modellingrating, numberofratings
      }`)
      .then((data) => {
        setPeople(data)
        setLoading(false)
      })
  }, [])

  const calculateOverallRating = (person: Person) => {
    const allRatings = [
      person.facerating,
      person.eyesrating,
      person.lipsrating,
      person.actingrating,
      person.voicerating,
      person.modellingrating,
    ].filter((r): r is number => typeof r === "number" && r > 0)
    return allRatings.length > 0
      ? Math.round(allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length)
      : 0
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl aspect-[3/4] mb-3"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-3 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      {people.map((person, index) => {
        const overallRating = calculateOverallRating(person)

        return (
          <Link
            key={person._id}
            href={`/people/${person.slug.current}`}
            className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-br from-orange-50 to-red-100 border border-orange-200"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
              <Image
                src={urlFor(person.image) || "/placeholder.svg"}
                alt={person.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Trending indicator */}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-full shadow-lg">
                <Fire className="h-4 w-4" />
              </div>

              {/* Rank badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                <span className="font-bold text-orange-600 text-sm">#{index + 1}</span>
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-sm text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
                {person.name}
              </h3>

              <div className="flex flex-wrap gap-1 mb-3">
                {person.profession?.slice(0, 2).map((prof, idx) => (
                  <span
                    key={idx}
                    className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium"
                  >
                    {prof}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-yellow-600">
                  <Crown className="h-3 w-3" />
                  <span className="font-medium">{person.powerMeter}</span>
                </div>

                {overallRating > 0 && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-medium">{overallRating}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>{person.numberofratings}</span>
                </div>
              </div>

              {/* Trending indicator */}
              <div className="flex items-center justify-center gap-1 mt-3 text-orange-600 bg-orange-50 py-1 rounded-lg">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs font-medium">Trending</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
