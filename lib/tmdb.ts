import axios from 'axios'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

// ✅ Fetch full person profile (used in processCelebrityData)
export const fetchCelebrityData = async (tmdbId: string) => {
  const url = `${TMDB_BASE}/person/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`

  try {
    const response = await axios.get(url)
    if (!response.data || !response.data.name) {
      console.warn(`⚠️ No valid data returned from TMDB for celebrity ID ${tmdbId}`)
      return null
    }
    return response.data
  } catch (error) {
    console.error('❌ Error fetching TMDB celebrity profile:', tmdbId, error)
    return null
  }
}

// ✅ Fetch movie credits for a person
export const fetchFilmCredits = async (personId: string | number) => {
  const url = `${TMDB_BASE}/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`

  try {
    const response = await axios.get(url)
    return response.data || { cast: [], crew: [] }
  } catch (error) {
    console.error('❌ Error fetching film credits from TMDB for person ID:', personId, error)
    return { cast: [], crew: [] }
  }
}
