'use client'

import Image from 'next/image'

interface Track {
  title: string
  artist?: string
  coverImageUrl?: string
  description?: string
}

interface Props {
  track: Track
}

export default function AdvancedMusicPlayerWithUrl({ track }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-zinc-900 to-neutral-800 text-white rounded-2xl shadow-xl p-6 space-y-6">
      {/* Cover Image */}
      {track.coverImageUrl && (
        <div className="w-full flex justify-center">
          <Image
            src={track.coverImageUrl}
            alt={track.title}
            width={300}
            height={300}
            className="rounded-xl object-cover shadow-lg"
          />
        </div>
      )}

      {/* Title + Artist */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold">{track.title}</h2>
        {track.artist && <p className="text-sm text-gray-400">{track.artist}</p>}
      </div>

      {/* Description */}
      {track.description && (
        <p className="text-sm text-center text-gray-300 max-w-xl mx-auto whitespace-pre-line">
          {track.description}
        </p>
      )}

      {/* Playback Note */}
      <p className="text-center text-sm text-pink-400 italic">
        Playing through the global music bar below.
      </p>
    </div>
  )
}
