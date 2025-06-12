// For film -> facesCelebs reference (cast/crew)
export interface FilmCredit {
  celebrity: {
    slug: { current: string }
    name: string
  }
  role: string
}

// For facesCelebs -> film reference
export interface PersonCredit {
  film: {
    slug: { current: string }
    title: string
  }
  role: string
}
