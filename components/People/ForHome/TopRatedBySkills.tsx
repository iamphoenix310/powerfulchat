"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Star, Trophy, Mic, Camera, Briefcase, Award, Target } from "lucide-react"

interface Person {
  _id: string
  name: string
  slug: { current: string }
  image: any
  profession: string[]
  actingrating?: number
  voicerating?: number
  modellingrating?: number
  politicsrating?: number
  numberofratings?: number
  country?: string
}

export default function TopRatedBySkills() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(`*[_type == "facesCelebs" && (defined(actingrating) || defined(voicerating) || defined(modellingrating) || defined(politicsrating))] {
        _id, name, slug, image, profession, country,
        actingrating, voicerating, modellingrating, politicsrating, numberofratings,
        "avgSkills": (coalesce(actingrating, 0) + coalesce(voicerating, 0) + coalesce(modellingrating, 0) + coalesce(politicsrating, 0)) / 4
      } | order(avgSkills desc)[0...10]`)
      .then((data) => {
        setPeople(data)
        setLoading(false)
      })
  }, [])

  const calculateSkillsRating = (person: Person) => {
    const ratings = [person.actingrating, person.voicerating, person.modellingrating, person.politicsrating].filter(
      (r): r is number => typeof r === "number" && r > 0,
    )
    return ratings.length > 0 ? Math.round(ratings.reduce((sum, r) => (sum ?? 0) + (r ?? 0), 0) / ratings.length) : 0
  }

  const getSkillIcon = (skill: string, rating?: number) => {
    if (!rating) return null

    const iconProps = { className: "h-4 w-4" }
    switch (skill) {
      case "acting":
        return <Camera {...iconProps} />
      case "voice":
        return <Mic {...iconProps} />
      case "modelling":
        return <Star {...iconProps} />
      case "politics":
        return <Briefcase {...iconProps} />
      default:
        return <Target {...iconProps} />
    }
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
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      {people.map((person, index) => {
        const skillsRating = calculateSkillsRating(person)
        const topSkill = Math.max(
          person.actingrating || 0,
          person.voicerating || 0,
          person.modellingrating || 0,
          person.politicsrating || 0,
        )

        return (
          <Link
            key={person._id}
            href={`/people/${person.slug.current}`}
            className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
              <Image
                src={urlFor(person.image) || "/placeholder.svg"}
                alt={person.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Ranking badge */}
              {index < 3 && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2 rounded-full shadow-lg">
                  {index === 0 && <Trophy className="h-4 w-4" />}
                  {index === 1 && <Award className="h-4 w-4" />}
                  {index === 2 && <Star className="h-4 w-4 fill-current" />}
                </div>
              )}

              {/* Skills rating */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-blue-500 fill-current" />
                  <span className="font-bold text-gray-800 text-sm">{skillsRating}</span>
                </div>
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-sm text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                {person.name}
              </h3>

              <div className="flex flex-wrap gap-1 mb-3">
                {person.profession?.slice(0, 2).map((prof, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {prof}
                  </span>
                ))}
              </div>

              {/* Skills breakdown */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {person.actingrating && (
                  <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg">
                    <Camera className="h-3 w-3 text-purple-500" />
                    <span className="text-xs font-medium text-purple-700">{person.actingrating}</span>
                  </div>
                )}
                {person.voicerating && (
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                    <Mic className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-green-700">{person.voicerating}</span>
                  </div>
                )}
                {person.modellingrating && (
                  <div className="flex items-center gap-1 bg-pink-50 px-2 py-1 rounded-lg">
                    <Star className="h-3 w-3 text-pink-500 fill-current" />
                    <span className="text-xs font-medium text-pink-700">{person.modellingrating}</span>
                  </div>
                )}
                {person.politicsrating && (
                  <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                    <Briefcase className="h-3 w-3 text-orange-500" />
                    <span className="text-xs font-medium text-orange-700">{person.politicsrating}</span>
                  </div>
                )}
              </div>

              {/* Rating count */}
              {person.numberofratings && (
                <div className="text-center text-xs text-gray-500">{person.numberofratings} ratings</div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
