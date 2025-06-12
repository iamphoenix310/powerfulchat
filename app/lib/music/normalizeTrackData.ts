export interface RawTrack {
  _id: string
  title: string
  artist?: string
  coverImageUrl?: string
  slug: { current: string } | string
  lyrics?: { time: number; line: string; _key?: string }[]
  description?: string
  albumSlug?: string
  r2FileUrl: string          // WAV
  r2FileUrlmp3?: string      // MP3 (optional)
}


export function normalizeTrackData(tracks: RawTrack[], type: 'single' | 'album') {
  return tracks.map((track) => {
    const finalUrl = track.r2FileUrlmp3 || track.r2FileUrl
    const key = finalUrl.split('/').slice(4).join('/')

    return {
      _id: track._id,
      audioUrl: finalUrl,
      key,
      r2FileUrl: track.r2FileUrl,
      r2FileUrlmp3: track.r2FileUrlmp3,
      slug: typeof track.slug === 'string' ? track.slug : track.slug?.current,
      albumSlug: track.albumSlug || undefined,
      type,
      lyrics: track.lyrics || [],
      playId: `${Date.now()}-${track._id}`,
      track: {
        title: track.title,
        artist: track.artist || 'Unknown',
        coverImageUrl: track.coverImageUrl,
        description: track.description || '',
      },
    }
    
  })
}
