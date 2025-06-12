"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { urlFor, newsClient } from "@/app/utils/sanityClient"
import PowerMeter from "@/components/People/powerMeter"
import { AdvancedPeopleFilters, type PeopleFilterInput } from "@/components/People/AdvancedPeopleFilters"
import { Loader2, FilterX, Star, Heart, Users } from "lucide-react"
import AdBlock from "../Ads/AdBlock"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const BATCH_SIZE = 24

// Enhanced person interface with rating data
interface EnhancedPerson {
  _id: string
  name: string
  slug: { current: string }
  profession: string[]
  powerMeter: number
  image: any
  ethnicity: string[]
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

// Compact ratings display showing averages
const PersonRatings: React.FC<{ person: EnhancedPerson }> = ({ person }) => {
  // Calculate average looks rating (face, eyes, lips)
  const looksRatings = [person.facerating, person.eyesrating, person.lipsrating].filter(
 (rating): rating is number => typeof rating === 'number' && rating !== undefined && rating !== null && rating > 0,
  ) as number[]; // Explicitly cast to number[] after filtering
  const avgLooks =
    looksRatings.length > 0
      ? Math.round(looksRatings.reduce((sum, rating) => sum + rating, 0) / looksRatings.length)
      : null

  // Calculate average skills rating (acting, voice, modelling, politics)
  const skillsRatings = [person.actingrating, person.voicerating, person.modellingrating, person.politicsrating].filter(
    (rating): rating is number => typeof rating === 'number' && rating !== undefined && rating !== null && rating > 0,
  ) as number[];
  const avgSkills =
    skillsRatings.length > 0
      ? Math.round(skillsRatings.reduce((sum: number, rating: number) => sum + rating, 0) / skillsRatings.length)
      : null

  if (!avgLooks && !avgSkills) return null

  return (
    <div className="flex items-center justify-between gap-2 mt-2">
      {/* Average Looks Rating */}
      {avgLooks && (
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 px-2 py-1 rounded-full border border-pink-100 dark:border-pink-800">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-1 rounded-full">
            <Heart className="w-2.5 h-2.5 text-white fill-current" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-pink-700 dark:text-pink-300">{avgLooks}</span>
            <span className="text-[10px] text-pink-600 dark:text-pink-400 leading-none">Looks</span>
          </div>
        </div>
      )}

      {/* Average Skills Rating */}
      {avgSkills && (
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1 rounded-full">
            <Star className="w-2.5 h-2.5 text-white fill-current" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{avgSkills}</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 leading-none">Skills</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced person card component
const PersonCard: React.FC<{
  person: EnhancedPerson
  index: number
  isLast: boolean
  lastPersonRef: (node: HTMLDivElement | null) => void
}> = ({ person, index, isLast, lastPersonRef }) => {
  return (
    <Card
      ref={isLast ? lastPersonRef : null}
      className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-zinc-900 border-0 shadow-md"
    >
      <Link href={person.slug?.current ? `/people/${person.slug.current}` : "#"}>
        <div className="relative">
          {/* Image */}
          <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 overflow-hidden">
            <Image
              src={person.image ? urlFor(person.image) : "/default-profile.png"}
              alt={person.name || "Person image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              priority={index < 12}
            />

            {/* Power meter overlay */}
            {person.powerMeter !== undefined && (
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-bold text-white">{person.powerMeter}</span>
                </div>
              </div>
            )}

            {/* Rating count badge */}
            {person.numberofratings && person.numberofratings > 0 && (
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-zinc-600" />
                  <span className="text-xs font-medium text-zinc-700">{person.numberofratings}</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4 space-y-3">
            {/* Name and profession */}
            <div className="space-y-1">
              <h3 className="font-bold text-sm leading-tight line-clamp-2 text-zinc-800 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                {person.name || "Unnamed Person"}
              </h3>
              <div className="flex flex-wrap gap-1">
                {person.profession?.slice(0, 2).map((prof, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                    {prof}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Power meter */}
            {person.powerMeter !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Power Meter</span>
                  {/* <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{person.powerMeter}</span> */}
                </div>
                <PowerMeter value={person.powerMeter} />
              </div>
            )}

            {/* Ratings */}
            <PersonRatings person={person} />

            {/* Additional info */}
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
              {person.country && <span className="truncate">{person.country}</span>}
              {person.gender && <span className="capitalize">{person.gender}</span>}
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  )
}

const filtersToQueryString = (filters: PeopleFilterInput): string => {
  const params = new URLSearchParams()
  ;(Object.keys(filters) as Array<keyof PeopleFilterInput>).forEach((key) => {
    const value = filters[key]
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value))
    }
  })
  return params.toString()
}

const queryStringToFilters = (searchParams: URLSearchParams | null): PeopleFilterInput => {
  const filters: PeopleFilterInput = {}
  if (!searchParams) return filters
  const validKeys: Array<keyof PeopleFilterInput> = [
    "name",
    "country",
    "ethnicity",
    "gender",
    "eyeColor",
    "hairColor",
    "bodyType",
    "isDead",
  ]
  validKeys.forEach((key) => {
    const value = searchParams.get(key)
    if (value !== null && value.trim() !== "") {
      if (key === "isDead") {
        if (value === "true" || value === "false") filters.isDead = value
        else console.warn(`[PeoplePage] Invalid value for 'isDead' in URL: '${value}'. Ignoring.`)
      } else {
        filters[key as Exclude<keyof PeopleFilterInput, "isDead">] = value
      }
    }
  })
  return filters
}

const EnhancedPeoplePage: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [appliedFilters, setAppliedFilters] = useState<PeopleFilterInput>({})
  const [people, setPeople] = useState<EnhancedPerson[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadingRef = useRef(loading)
  const isFetchingMoreRef = useRef(isFetchingMore)
  const hasMoreRef = useRef(hasMore)

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])
  useEffect(() => {
    isFetchingMoreRef.current = isFetchingMore
  }, [isFetchingMore])
  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  useEffect(() => {
    const filtersFromURL = queryStringToFilters(searchParams)
    if (JSON.stringify(filtersFromURL) !== JSON.stringify(appliedFilters)) {
      setAppliedFilters(filtersFromURL)
    }
  }, [searchParams, appliedFilters])

  const waitForFilteredPeople = async (
    filters: PeopleFilterInput,
    tries = 5,
    delay = 1000,
  ): Promise<EnhancedPerson[]> => {
    for (let i = 0; i < tries; i++) {
      try {
        const res = await fetch("/api/people/search", {
          method: "POST",
          body: JSON.stringify(filters),
          headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()
        if (data.people && data.people.length > 0) return data.people
      } catch (e) {
        console.error(`[PeoplePage] Fallback API attempt ${i + 1} failed:`, e)
      }
      if (i < tries - 1) await new Promise((r) => setTimeout(r, delay))
    }
    console.warn("[PeoplePage] Fallback API attempts exhausted.")
    return []
  }

  const buildSanityQuery = (filters: PeopleFilterInput, start = 0, limit: number = BATCH_SIZE): string => {
    const conditions: string[] = [`_type == "facesCelebs"`, `!(_id in path("drafts.**"))`]
    const escapeQuotes = (str: string) => str.replace(/"/g, '\\"')

    if (filters.name && filters.name.trim() !== "") {
      const nameTerm = escapeQuotes(filters.name.trim().toLowerCase())
      conditions.push(`defined(name) && lower(name) match "*${nameTerm}*"`)
    }
    if (filters.country && filters.country.trim() !== "") {
      const countryTerm = escapeQuotes(filters.country.trim().toLowerCase())
      conditions.push(`defined(country) && lower(country) == "${countryTerm}"`)
    }
    if (filters.ethnicity && filters.ethnicity.trim() !== "") {
      const ethnicityTerm = escapeQuotes(filters.ethnicity.trim().toLowerCase())
      conditions.push(`defined(ethnicity) && count(ethnicity[lower(@) match "*${ethnicityTerm}*"]) > 0`)
    }
    if (filters.gender && filters.gender.trim() !== "") {
      const genderTerm = escapeQuotes(filters.gender.trim().toLowerCase())
      conditions.push(`defined(gender) && lower(gender) == "${genderTerm}"`)
    }
    if (filters.eyeColor && filters.eyeColor.trim() !== "") {
      const eyeColorTerm = escapeQuotes(filters.eyeColor.trim().toLowerCase())
      conditions.push(`defined(eyeColor) && lower(eyeColor) == "${eyeColorTerm}"`)
    }
    if (filters.hairColor && filters.hairColor.trim() !== "") {
      const hairColorTerm = escapeQuotes(filters.hairColor.trim().toLowerCase())
      conditions.push(`defined(hairColor) && lower(hairColor) == "${hairColorTerm}"`)
    }
    if (filters.bodyType && filters.bodyType.trim() !== "") {
      const bodyTypeTerm = escapeQuotes(filters.bodyType.trim().toLowerCase())
      conditions.push(`defined(bodyType) && lower(bodyType) == "${bodyTypeTerm}"`)
    }
    if (filters.isDead === "true") {
      conditions.push(`isDead == true`)
    } else if (filters.isDead === "false") {
      conditions.push(`isDead == false`)
    }

    // Enhanced query to include rating data
    const queryString = `*[${conditions.join(" && ")}] | order(_updatedAt desc)[${start}...${start + limit}] { 
      _id, name, slug, profession, powerMeter, image, ethnicity, country, gender,
      facerating, eyesrating, lipsrating, actingrating, voicerating, modellingrating, politicsrating, numberofratings
    }`
    return queryString
  }

  const fetchPeople = useCallback(
    async (currentFilters: PeopleFilterInput, pageIndex = 0, append = false) => {
      if (append) {
        if (isFetchingMoreRef.current) {
          console.warn("[PeoplePage] fetchPeople (append) called while already fetching more (ref). Aborting.")
          return
        }
        setIsFetchingMore(true)
        isFetchingMoreRef.current = true
      } else {
        if (loadingRef.current && pageIndex > 0) {
          console.warn(
            "[PeoplePage] fetchPeople (initial/new filter) called while 'loadingRef' is true for page > 0. Aborting.",
          )
          return
        }
        setLoading(true)
        loadingRef.current = true
        setPeople([])
      }
      setError(null)

      try {
        const start = pageIndex * BATCH_SIZE
        const query = buildSanityQuery(currentFilters, start, BATCH_SIZE)
        console.log("[PeoplePage] Executing Sanity Query:", query)
        let result = await newsClient.fetch(query)

        const hasActiveFilters = Object.values(currentFilters).some(
          (v) => v !== undefined && v !== null && (typeof v === "string" ? v.trim() !== "" : true),
        )

        if (result.length === 0 && hasActiveFilters && pageIndex === 0) {
          console.warn("[PeoplePage] Sanity returned 0 results. Trying fallback API...")
          result = await waitForFilteredPeople(currentFilters)
        }

        setPeople((prev) => (append ? [...prev, ...result] : result))
        setHasMore(result.length === BATCH_SIZE)
      } catch (err: any) {
        console.error("[PeoplePage] Error fetching people:", err)
        setError(`Failed to fetch. ${err.message || "Please try again."}`)
      } finally {
        if (append) {
          setIsFetchingMore(false)
          isFetchingMoreRef.current = false
        } else {
          setLoading(false)
          loadingRef.current = false
        }
      }
    },
    [newsClient],
  )

  useEffect(() => {
    if (loadingRef.current && page > 0) {
      console.log("[PeoplePage] useEffect[appliedFilters]: Main load in progress (ref) and page > 0, deferring fetch.")
      return
    }
    console.log(
      "[PeoplePage] useEffect[appliedFilters] triggered. Current page state:",
      page,
      "Fetching for page 0 with filters:",
      appliedFilters,
    )
    setPage(0)
    fetchPeople(appliedFilters, 0, false)
  }, [appliedFilters, fetchPeople])

  const handleFilterChangeFromUI = useCallback(
    (newUiFilters: PeopleFilterInput) => {
      const newQueryString = filtersToQueryString(newUiFilters)
      router.push(`${pathname}?${newQueryString}`, { scroll: false })
    },
    [router, pathname],
  )

  const lastPersonRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect()
      if (loadingRef.current || isFetchingMoreRef.current || !hasMoreRef.current) return

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            console.log("[PeoplePage] IntersectionObserver: Reached end, loading more.")
            setPage((prevPage) => {
              const nextPageToFetch = prevPage + 1
              fetchPeople(appliedFilters, nextPageToFetch, true)
              return nextPageToFetch
            })
          }
        },
        { threshold: 0.1 },
      )
      if (node) observer.current.observe(node)
    },
    [appliedFilters, fetchPeople],
  )

  const isMainLoading = loading && !isFetchingMore

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdBlock adSlot="8397118667" className="my-6 mx-auto" />

      <div className="lg:flex lg:gap-x-8">
        <aside className="hidden lg:block lg:w-80 xl:w-96 mb-8 lg:mb-0 lg:sticky lg:top-8 h-fit">
          <AdvancedPeopleFilters onFilterChange={handleFilterChangeFromUI} initialFilters={appliedFilters} />
        </aside>

        <main className="lg:flex-1 min-h-[calc(100vh-200px)]">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-center lg:text-left bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Explore People
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-center lg:text-left">
              Discover profiles with ratings, power meters, and detailed insights
            </p>
          </div>

          {error && (
            <div
              className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-md mb-6"
              role="alert"
            >
              <strong className="font-bold">Error:</strong> <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {isMainLoading && people.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-12 min-h-[300px]">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-lg text-muted-foreground">Loading people...</p>
            </div>
          ) : !isMainLoading && people.length === 0 ? (
            <div className="w-full text-center py-12 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg min-h-[300px] flex flex-col justify-center items-center border dark:border-zinc-700">
              <FilterX size={48} className="text-zinc-400 dark:text-zinc-500 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 mb-2">No People Found</h3>
              <p className="text-zinc-500 dark:text-zinc-400">Try adjusting your filters or check again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {people.map((person, index) => {
                const isLast = index === people.length - 1
                return (
                  <PersonCard
                    key={person._id || `person-${index}`}
                    person={person}
                    index={index}
                    isLast={isLast}
                    lastPersonRef={lastPersonRef}
                  />
                )
              })}
            </div>
          )}

          {isFetchingMore && (
            <div className="flex justify-center items-center mt-8 py-6">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="ml-3 text-muted-foreground">Loading more...</p>
            </div>
          )}

          {!isMainLoading && !isFetchingMore && !hasMore && people.length > 0 && (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-10 py-4">
              You&apos;ve reached the end of the list.
            </p>
          )}
        </main>
      </div>
    </div>
  )
}

export default EnhancedPeoplePage
