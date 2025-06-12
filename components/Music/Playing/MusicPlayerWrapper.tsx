'use client'

import LyricsDisplay from '@/components/Music/Display/LyricsDisplay'
import { useMusicPlayer } from '@/components/Music/Playing/MusicPlayerContext'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function MusicPlayerWrapper({
  shouldAutoPlay,
}: {
  shouldAutoPlay: boolean
}) {
  const { currentTrack, playTrack } = useMusicPlayer()
  const [hasStreamed, setHasStreamed] = useState(false)

  useEffect(() => {
    setHasStreamed(true)
  }, [currentTrack])
  
  if (!currentTrack) return null

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
      {currentTrack.track.coverImageUrl && (
        <div className="w-full md:w-[300px] aspect-square relative overflow-hidden rounded-xl shadow-lg">
          <Image
            src={currentTrack.track.coverImageUrl}
            alt={currentTrack.track.title}
            fill
            className="object-cover rounded-xl"
            priority
          />
        </div>
      )}

      <div className="flex-1 w-full text-center md:text-left space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {currentTrack.track.title}
        </h1>

        {currentTrack.track.artist && (
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            By {currentTrack.track.artist}
          </p>
        )}

        {currentTrack.track.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {currentTrack.track.description}
          </p>
        )}

        <div className="flex flex-col md:flex-row">
          <LyricsDisplay lyrics={(currentTrack as any).lyrics || []} />
        </div>
      </div>
    </div>
  )
}
