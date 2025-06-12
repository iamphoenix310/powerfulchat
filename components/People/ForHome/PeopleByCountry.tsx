"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Users, Star, Heart } from "lucide-react"

interface Person {
  _id: string
  name: string
  slug: { current: string }
  image: any
  profession: string[]
  country: string
  facerating?: number
  actingrating?: number
  numberofratings?: number
}

interface CountryGroup {
  country: string
  people: Person[]
  flag: string
}

export default function PeopleByCountry() {
  const [countryGroups, setCountryGroups] = useState<CountryGroup[]>([])
  const [loading, setLoading] = useState(true)

  // Country flag mapping
  const countryFlags: Record<string, string> = {
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    Canada: "🇨🇦",
    Australia: "🇦🇺",
    India: "🇮🇳",
    France: "🇫🇷",
    Germany: "🇩🇪",
    Italy: "🇮🇹",
    Spain: "🇪🇸",
    Brazil: "🇧🇷",
    Japan: "🇯🇵",
    "South Korea": "🇰🇷",
    China: "🇨🇳",
    Mexico: "🇲🇽",
    Argentina: "🇦🇷",
    Russia: "🇷🇺",
    Sweden: "🇸🇪",
    Norway: "🇳🇴",
    Denmark: "🇩🇰",
    Netherlands: "🇳🇱",
  }

  useEffect(() => {
    client
      .fetch(`*[_type == "facesCelebs" && defined(country) && country != ""] {
        _id, name, slug, image, profession, country,
        facerating, actingrating, numberofratings
      } | order(country asc)`)
      .then((data: Person[]) => {
        // Group by country and take top 3 from each
        const grouped = data.reduce((acc: Record<string, Person[]>, person) => {
          if (!acc[person.country]) {
            acc[person.country] = []
          }
          acc[person.country].push(person)
          return acc
        }, {})

        // Convert to array and limit to top countries with most people
        const countryArray = Object.entries(grouped)
          .map(([country, people]) => ({
            country,
            people: people.slice(0, 3), // Top 3 per country
            flag: countryFlags[country] || "🌍",
          }))
          .filter((group) => group.people.length >= 2) // Only countries with 2+ people
          .sort((a, b) => b.people.length - a.people.length)
          .slice(0, 6) // Top 6 countries

        setCountryGroups(countryArray)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl p-4 h-48"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {countryGroups.map((group) => (
        <div
          key={group.country}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{group.flag}</span>
              <div>
                <h3 className="font-bold text-lg">{group.country}</h3>
                <div className="flex items-center gap-1 text-blue-100">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{group.people.length} featured</span>
                </div>
              </div>
            </div>
          </div>

          {/* People */}
          <div className="p-4 space-y-3">
            {group.people.map((person, index) => (
              <Link
                key={person._id}
                href={`/people/${person.slug.current}`}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={urlFor(person.image) || "/placeholder.svg"}
                    alt={person.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 p-1 rounded-full">
                      <Star className="h-2 w-2 fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                    {person.name}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-1">{person.profession?.[0]}</p>
                </div>

                {/* Ratings */}
                <div className="flex items-center gap-2">
                  {person.facerating && (
                    <div className="flex items-center gap-1 bg-pink-100 px-2 py-1 rounded-full">
                      <Heart className="h-3 w-3 text-pink-500 fill-current" />
                      <span className="text-xs font-medium text-pink-700">{person.facerating}</span>
                    </div>
                  )}
                  {person.actingrating && (
                    <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-blue-500 fill-current" />
                      <span className="text-xs font-medium text-blue-700">{person.actingrating}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}

            {/* View all link */}
            <Link
              href={`/people?country=${encodeURIComponent(group.country)}`}
              className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              View all from {group.country} →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
