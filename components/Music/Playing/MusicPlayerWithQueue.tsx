'use client'

import { useEffect } from 'react'
import MusicPlayerWrapper from './MusicPlayerWrapper'
import { useMusicPlayer, TrackData } from '@/components/Music/Playing/MusicPlayerContext'

interface Props {
  track: TrackData
}

export default function SingleTrackPlayer({ track }: Props) {
  const { playTrack } = useMusicPlayer()

  useEffect(() => {
    if (!track) return
    playTrack(track, 0) // ✅ Play only this track, no queue
  }, [track])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <MusicPlayerWrapper shouldAutoPlay={true} />
    </div>
  )
}
