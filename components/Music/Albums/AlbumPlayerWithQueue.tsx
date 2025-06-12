'use client'

import { useEffect } from 'react'
import { useMusicPlayer, TrackData } from '@/components/Music/Playing/MusicPlayerContext'
import AlbumTrackList from './AlbumTrackList'
import MusicPlayerWrapper from '@/components/Music/Playing/MusicPlayerWrapper'

interface Props {
  trackList: TrackData[]
  initialIndex?: number
}

export default function AlbumPlayerWithQueue({ trackList, initialIndex = 0 }: Props) {
  const { playTrack, setQueue, currentTrack } = useMusicPlayer()

  useEffect(() => {
    if (trackList.length) {
      setQueue(trackList)
      playTrack(trackList[initialIndex], initialIndex)
    }
  }, [trackList, initialIndex])

  const currentIndex = trackList.findIndex(t => t._id === currentTrack?._id)

  const handleSelectTrack = (index: number) => {
    playTrack(trackList[index], index)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto">
      <div className="md:w-2/3">
        {currentTrack && (
          <MusicPlayerWrapper key={currentTrack.playId} shouldAutoPlay={true} />
        )}
      </div>
      <div className="md:w-1/3">
        <AlbumTrackList
          tracks={trackList}
          currentIndex={currentIndex}
          onSelect={handleSelectTrack}
        />
      </div>
    </div>
  )
}
