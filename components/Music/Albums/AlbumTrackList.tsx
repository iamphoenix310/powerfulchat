'use client'

import { TrackData } from '@/components/Music/Playing/MusicPlayerContext'
import clsx from 'clsx'
import { Music2 } from 'lucide-react'
import Image from 'next/image'

interface Props {
  tracks: TrackData[]
  currentIndex: number
  onSelect: (index: number) => void
}

export default function AlbumTrackList({ tracks, currentIndex, onSelect }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 space-y-4 max-h-[600px] overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tracklist</h3>
      {tracks.map((track, index) => {
        const isCurrent = index === currentIndex

        return (
          <div
            key={track.key}
            onClick={() => onSelect(index)}
            className={clsx(
              'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all group',
              isCurrent
                ? 'bg-gray-100 dark:bg-gray-800 border-l-4 border-black dark:border-white shadow-sm'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            {track.track.coverImageUrl && (
              <Image
                src={track.track.coverImageUrl}
                alt={track.track.title}
                width={50}
                height={50}
                className="rounded-md object-cover"
              />
            )}
            <div className="flex-1 truncate">
              <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                {track.track.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {track.track.artist}
              </p>
            </div>
            {isCurrent && (
              <Music2 className="text-red-600 w-4 h-4 flex-shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
