import { client } from '@/app/utils/sanityClient'
import { fetchFilmCredits } from '@/lib/tmdb'
import { importFilmFromTmdb } from '@/scripts/movies/importFilmFromTmdb'
import { nanoid } from 'nanoid'

const patchFilm = async (filmId: string, celebId: string, role: string, department: string) => {
  const film = await client.fetch(`*[_type == "films" && _id == $id][0]{ credits[]->{ _id } }`, { id: filmId })
  const alreadyLinked = film?.credits?.some((c: any) => c._id === celebId)
  if (alreadyLinked) return

  await client.patch(filmId)
    .setIfMissing({ credits: [] })
    .append('credits', [{
      _type: 'object',
      _key: nanoid(),
      celebrity: { _type: 'reference', _ref: celebId },
      role,
      department
    }])
    .commit()
}

const patchCelebrity = async (celebId: string, filmId: string, role: string) => {
  const celeb = await client.fetch(`*[_type == "facesCelebs" && _id == $id][0]{ credits }`, { id: celebId })
  const alreadyLinked = celeb?.credits?.some((c: any) => c.film?._ref === filmId)
  if (alreadyLinked) return

  await client.patch(celebId)
    .setIfMissing({ credits: [] })
    .append('credits', [{
      _type: 'object',
      _key: nanoid(),
      film: { _type: 'reference', _ref: filmId },
      role
    }])
    .commit()
}

const run = async () => {
  const people = await client.fetch(`*[_type == "facesCelebs" && defined(tmdbId)]{ _id, tmdbId }`)

  for (const person of people) {
    const tmdbId = person.tmdbId.toString()
    const credits = await fetchFilmCredits(tmdbId)

    const allFilms = [...(credits.cast || []), ...(credits.crew || [])]

    for (const film of allFilms) {
      try {
        const filmDoc = await client.fetch(`*[_type == "films" && tmdbId == $id][0]{ _id }`, { id: film.id })

        let filmId = filmDoc?._id
        if (!filmId) {
          await importFilmFromTmdb(film.id)
          const refetched = await client.fetch(`*[_type == "films" && tmdbId == $id][0]{ _id }`, { id: film.id })
          filmId = refetched?._id
          if (!filmId) continue
        }

        const role = film.character || film.job || 'Unknown'
        const dept = film.department || 'Acting'

        await patchFilm(filmId, person._id, role, dept)
        await patchCelebrity(person._id, filmId, role)

        console.log(`✅ Linked ${person._id} ↔ ${filmId}`)

      } catch (err) {
        console.warn(`❌ Skipping TMDB ID ${film.id}`, err)
      }
    }
  }
}

run()
