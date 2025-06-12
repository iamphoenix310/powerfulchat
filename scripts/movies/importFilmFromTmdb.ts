import dotenv from 'dotenv'
import { nanoid } from 'nanoid'
import { client } from '@/app/utils/sanityClient'
import { processCelebrityData } from '@/pages/api/processCelebData'

dotenv.config()

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/original'

// ⏱ Safe fetch with timeout + retry
const fetchWithTimeoutAndRetry = async (url: string, timeout = 8000, retries = 2): Promise<any> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { accept: 'application/json' }
      })

      if (!res.ok) throw new Error(`TMDB error ${res.status}: ${url}`)
      return await res.json()
    } catch (err) {
      if (attempt === retries) throw new Error('❌ Failed to fetch TMDB resource after retries.')
    } finally {
      clearTimeout(timer)
    }
  }
}

// ➕ Add film to celebrity doc (avoiding duplicates)
const patchCelebrityWithFilm = async ({
  celebrityId,
  filmId,
  role,
}: {
  celebrityId: string
  filmId: string
  role: string
}) => {
  const existing = await client.fetch(
    `*[_type == "facesCelebs" && _id == $id][0]{ credits }`,
    { id: celebrityId }
  )

  const alreadyLinked = existing?.credits?.some((c: any) => c.film?._ref === filmId)
  if (alreadyLinked) return

  await client
    .patch(celebrityId)
    .setIfMissing({ credits: [] })
    .append('credits', [
      {
        _type: 'object',
        _key: nanoid(),
        film: { _type: 'reference', _ref: filmId },
        role
      }
    ])
    .commit({ autoGenerateArrayKeys: true })
}

const uploadImageFromTmdb = async (imagePath: string) => {
  if (!imagePath) return null
  try {
    const imageUrl = `${TMDB_IMAGE}${imagePath}`
    const res = await fetch(imageUrl)
    const buffer = await res.arrayBuffer()
    const file = Buffer.from(buffer)

    const asset = await client.assets.upload('image', file, {
      filename: imagePath.split('/').pop()
    })

    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  } catch {
    return null
  }
}

const getTmdbMovieData = async (tmdbId: string) => {
  const details = await fetchWithTimeoutAndRetry(
    `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos`
  )

  const credits = await fetchWithTimeoutAndRetry(
    `${TMDB_BASE}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}`
  )

  return { ...details, credits }
}

// 🔁 Get celeb ref if exists in Sanity, else log missing
const getCelebrityRef = async (name: string, tmdbId: number, missing: Set<string>) => {
  const existing = await client.fetch(`*[_type == "facesCelebs" && tmdbId == $tmdbId][0]{ _id }`, { tmdbId })
  if (existing?._id) return existing._id

  try {
    const newCeleb = await processCelebrityData(tmdbId.toString(), {
      importBio: true,
      importMoviesOnly: false
    })

    if (newCeleb?._id) return newCeleb._id
    missing.add(tmdbId.toString())
    return null
  } catch (err) {
    missing.add(tmdbId.toString())
    return null
  }
}

export const importFilmFromTmdb = async (tmdbId: string) => {
  const existingFilm = await client.fetch(
    `*[_type == "films" && tmdbId == $tmdbId][0]{ _id, title }`,
    { tmdbId: Number(tmdbId) }
  )

  if (existingFilm) {
    console.log(`🔁 Film already exists: ${existingFilm.title} (${tmdbId})`)
    return { alreadyExists: true, title: existingFilm.title }
  }

  const data = await getTmdbMovieData(tmdbId)

  const poster = await uploadImageFromTmdb(data.poster_path)
  const backdrop = await uploadImageFromTmdb(data.backdrop_path)
  const trailer = data.videos?.results?.find((v: { site: string; type: string }) => v.site === 'YouTube' && v.type === 'Trailer')

  const filmSlug = data.title.toLowerCase().replace(/\s+/g, '-').slice(0, 96)
  const missingCelebs = new Set<string>()
  const credits: any[] = []

  const seenCelebs = new Set<string>() // to track deduplication by celeb+department

  const addCredit = async (name: string, tmdbId: number, role: string, department: string) => {
    const key = `${tmdbId}-${department}`
    if (seenCelebs.has(key)) return
    seenCelebs.add(key)

    const refId = await getCelebrityRef(name, tmdbId, missingCelebs)
    if (refId) {
      credits.push({
        _key: nanoid(),
        celebrity: { _type: 'reference', _ref: refId },
        role,
        department,
      })
    }
  }

  for (const cast of data.credits.cast.slice(0, 10)) {
    await addCredit(cast.name, cast.id, cast.character, 'Acting')
  }

  for (const crew of data.credits.crew.filter((c: { job: string }) => ['Director', 'Writer'].includes(c.job))) {
    await addCredit(crew.name, crew.id, crew.job, crew.department)
  }

  const filmDoc = {
    _type: 'films',
    _id: `film-${nanoid()}`,
    tmdbId: Number(tmdbId),
    title: data.title,
    slug: { _type: 'slug', current: filmSlug },
    description: data.overview,
    releaseDate: data.release_date,
    runtime: data.runtime,
    voteAverage: data.vote_average,
    voteCount: data.vote_count,
    imdbId: data.imdb_id,
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
    poster,
    backdrop,
    genres: data.genres?.map((g: { name: string }) => g.name),
    credits,
  }

  await client.create(filmDoc)

  const savedFilm = await client.fetch(
    `*[_type == "films" && tmdbId == $id][0]{ _id }`,
    { id: Number(tmdbId) }
  )

  const filmId = savedFilm?._id

  if (filmId) {
    for (const credit of credits) {
      await patchCelebrityWithFilm({
        celebrityId: credit.celebrity._ref,
        filmId,
        role: credit.role
      })
    }
  }

  console.log(`✅ Imported film: ${filmDoc.title}`)
  return {
    _id: filmId,
    title: filmDoc.title,
    missingCelebs: Array.from(missingCelebs)
  }
}
