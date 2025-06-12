"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Button } from "@/components/ui/button"

interface Celebrity {
  _id: string
  name: string
  slug: { current: string }
  image: any
  profession: string[]
}

export default function CelebrityShowcase() {
  const [people, setPeople] = useState<Celebrity[]>([])

  useEffect(() => {
  const fetchCelebs = async () => {
    const query = `*[_type == "facesCelebs" && defined(image)] | order(_updatedAt desc)[0...4] {
      _id,
      name,
      slug,
      image,
      profession
    }`
    const result = await client.fetch(query)
    setPeople(result)
  }

  fetchCelebs()
}, [])


  return (
    <section className="w-full bg-gradient-to-br from-indigo-950 to-black text-white py-20">
      <div className="px-4 max-w-6xl mx-auto text-center space-y-10">
        <h2 className="text-3xl md:text-4xl font-bold">
          Explore Top Celebrities
        </h2>
        <p className="text-white/80 max-w-xl mx-auto text-base">
          Discover popular public figures, actors, musicians, models and creators — all rated by fans.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {people.map((person) => (
            <Link
              key={person._id}
              href={`/people/${person.slug.current}`}
              className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md border border-white/10 bg-white/5 hover:scale-105 transition-transform duration-300"
            >
              <Image
                src={urlFor(person.image)}
                alt={person.name}
                fill
                className="object-cover"
              />
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/people">
            <Button size="lg" className="px-6 py-3 text-base font-medium">
              See All Celebs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
