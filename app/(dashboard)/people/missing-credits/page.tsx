'use client'

import { useEffect, useState } from 'react'
import { client } from '@/app/utils/sanityClient'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PersonWithMissing {
  _id: string
  name: string
  tmdbId: number
  missing: number
    slug: {
        current: string
    }
}

export default function MissingCreditsDashboard() {
  const [people, setPeople] = useState<PersonWithMissing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPeopleWithMissing = async () => {
      setLoading(true)

      const query = `*[_type == "facesCelebs" && defined(tmdbId)]{ _id, name, tmdbId, slug }`
      const allPeople = await client.fetch(query)

      const results: PersonWithMissing[] = []

      for (const person of allPeople) {
        const creditCount = await client.fetch(
          `count(*[_type == "films" && credits[].celebrity._ref == $id])`,
          { id: person._id }
        )

        if (creditCount < 2) {
          results.push({ ...person, missing: creditCount })
        }
      }

      setPeople(results)
      setLoading(false)
    }

    fetchPeopleWithMissing()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">👀 People Missing Film Credits</h1>

      {loading ? (
        <p className="text-center text-zinc-500">Loading...</p>
      ) : people.length === 0 ? (
        <p className="text-center text-zinc-500">✅ No missing film credits detected.</p>
      ) : (
        <div className="space-y-4">
          {people.map((person) => (
            <div
              key={person._id}
              className="flex justify-between items-center bg-white dark:bg-zinc-900 border p-4 rounded-lg shadow"
            >
              <div>
                <p className="font-medium">{person.name}</p>
                <p className="text-sm text-zinc-500">TMDB ID: {person.tmdbId}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/add-celebs-here?preload=${person.tmdbId}`}>
                  <Button size="sm" variant="secondary">Reassign Credits</Button>
                </Link>
                <Link href={`/people/${person.slug.current}`}>
                  <Button size="sm" variant="outline">View Profile</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
