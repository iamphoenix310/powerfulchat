"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Star, Heart, Trophy, Crown, TrendingUp, Users, Eye, Smile } from 'lucide-react'

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
  politicsrating?: number
  numberofratings?: number
  country?: string
  gender?: string
}

export default function FamousPeoplePreview() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(`*[_type == "facesCelebs"] | order(powerMeter desc)[0...8]{
        _id, name, slug, image, profession, powerMeter, country, gender,
        facerating, eyesrating, lipsrating, actingrating, voicerating, 
        modellingrating, politicsrating, numberofratings
      }`)
      .then((data) => {
        setPeople(data)
        setLoading(false)
      })
  }, [])

  const calculateLooksRating = (person: Person) => {
    const ratings = [person.facerating, person.eyesrating, person.lipsrating].filter((r): r is number => typeof r === 'number' && r > 0);
 return ratings.length > 0 ? Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length) : null;
  }

  const calculateSkillsRating = (person: Person) => {
    const ratings = [person.actingrating, person.voicerating, person.modellingrating, person.politicsrating].filter((r): r is number => typeof r === 'number' && r > 0)
    return ratings.length > 0 ? Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length) : null
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl aspect-[3/4] mb-3"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-3 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {people.map((person, index) => {
        const looksRating = calculateLooksRating(person)
        const skillsRating = calculateSkillsRating(person)
        
        return (
          <Link
            key={person._id}
            href={`/people/${person.slug.current}`}
            className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={urlFor(person.image) || "/placeholder.svg"}
                alt={person.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                {/* Power meter badge */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Crown className="h-3 w-3" />
                  {person.powerMeter}
                </div>

                {/* Rating count */}
                {person.numberofratings && person.numberofratings > 0 && (
                  <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {person.numberofratings}
                  </div>
                )}
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-sm leading-tight mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                  {person.name}
                </h3>

                {/* Profession */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {person.profession?.slice(0, 2).map((prof, idx) => (
                    <span
                      key={idx}
                      className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      {prof}
                    </span>
                  ))}
                </div>

                {/* Ratings */}
                <div className="flex items-center justify-between gap-2">
                  {looksRating && (
                    <div className="flex items-center gap-1 bg-pink-500/80 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Heart className="h-3 w-3 text-white fill-current" />
                      <span className="text-white text-xs font-bold">{looksRating}</span>
                    </div>
                  )}

                  {skillsRating && (
                    <div className="flex items-center gap-1 bg-blue-500/80 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-white fill-current" />
                      <span className="text-white text-xs font-bold">{skillsRating}</span>
                    </div>
                  )}
                </div>

                {/* Country flag */}
                {person.country && (
                  <div className="mt-2 text-white/80 text-xs">
                    📍 {person.country}
                  </div>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
