import dotenv from 'dotenv'
dotenv.config()

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function fetchFilmDataWithCredits(tmdbId: number) {
  const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`)
  if (!res.ok) throw new Error("Failed to fetch film data")
  const data = await res.json()

  const trailer = data.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube")

  return {
    title: data.title,
    slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    overview: data.overview,
    release_date: data.release_date,
    runtime: data.runtime,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    imdb_id: data.imdb_id,
    youtubeTrailerUrl: trailer ? `https://youtube.com/watch?v=${trailer.key}` : null,
    genres: data.genres?.map((g: any) => g.name),
    cast: data.credits?.cast || [],
    crew: data.credits?.crew || [],
  }
}
