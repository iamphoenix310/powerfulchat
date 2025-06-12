import { client } from '@/app/utils/sanityClient'

interface Credit {
  film: { _ref: string }
  role: string
}

async function relinkAllCredits() {
  const people = await client.fetch(
    `*[_type == "facesCelebs" && defined(tmdbId)]{ _id, tmdbId }`
  )

  for (const person of people) {
    const tmdbId = String(person.tmdbId)
    const sanityId = person._id

    const credits = await client.fetch(
      `*[_type == "films" && credits[].celebrity._ref == $id]{ _id }`,
      { id: sanityId }
    )

    const relinked = credits.map((film: any) => ({
      _key: film._id,
      _type: 'object',
      film: { _type: 'reference', _ref: film._id },
      role: 'Unknown'
    }))

    await client
      .patch(sanityId)
      .setIfMissing({ credits: [] })
      .append('credits', relinked)
      .commit()

    console.log(`✅ Relinked ${relinked.length} credits for ${sanityId}`)
  }
}

relinkAllCredits()
