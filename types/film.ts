export interface Film {
  credits: any
  slug: { current: string }
  title: string
  description?: string
  releaseDate?: string
  trailerUrl?: string
  runtime?: number
  voteAverage?: number
  voteCount?: number
  imdbId?: string
  genres?: string[] | null // ✅ explicitly allow null or undefined
  poster?: {
    asset: {
      _ref: string
      _type: string
    }
  }
}
