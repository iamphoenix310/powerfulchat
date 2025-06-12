'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { useMusicPlayer } from '@/components/Music/Playing/MusicPlayerContext'

interface LyricLine {
  time: number
  line: string
}

export default function LyricsDisplay({ lyrics }: { lyrics: LyricLine[] }) {
  const { progress } = useMusicPlayer()
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!lyrics || lyrics.length === 0) return

    const current = lyrics.findIndex((line, index) => {
      const nextTime = lyrics[index + 1]?.time ?? Infinity
      return progress >= line.time && progress < nextTime
    })

    if (current !== -1 && current !== activeIndex) {
      setActiveIndex(current)

      const activeLine = lineRefs.current[current]
      if (activeLine && containerRef.current) {
        const offsetTop = activeLine.offsetTop - containerRef.current.offsetHeight / 2 + activeLine.offsetHeight / 2
        containerRef.current.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        })
      }
    }
  }, [progress, lyrics, activeIndex])

  return (
    <div
      ref={containerRef}
      className="w-full md:w-[300px] max-h-[300px] md:max-h-[500px] overflow-y-auto px-4 py-2 border-t md:border-l border-gray-300 dark:border-gray-700 md:ml-6"
    >
      <div className="flex flex-col gap-2">
      {Array.isArray(lyrics) && lyrics.length > 0 ? (
  lyrics.map((lyric, index) => (
    <div
      key={index}
      ref={(el) => {
        lineRefs.current[index] = el
      }}
      className={clsx(
        'text-sm md:text-base transition-opacity duration-500',
        {
          'opacity-100 text-black dark:text-white font-semibold scale-105': index === activeIndex,
          'opacity-50 text-gray-500': index !== activeIndex,
        }
      )}
    >
      {lyric.line}
    </div>
  ))
) : (
  <div className="text-gray-400 italic">Lyrics Coming Soon.</div>
)}

      </div>
    </div>
  )
}
