'use client'

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  RefObject,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'

export interface TrackData {
  _id: string | null | undefined
  audioUrl: string
  key: string
  slug?: string
  albumSlug?: string
  type?: 'single' | 'album'
  playId?: string
  track: {
    title: string
    artist?: string
    coverImageUrl?: string
    description?: string
  }
  r2FileUrl: string                // ✅ ADD THIS
  r2FileUrlmp3?: string  
}

type RepeatMode = 'off' | 'one' | 'all'

interface MusicPlayerContextValue {
  currentTrack: TrackData | null
  playTrack: (track: TrackData, index?: number) => void
  clearTrack: () => void
  playNext: () => void
  playPrev: () => void
  queue: TrackData[]
  setQueue: (tracks: TrackData[]) => void
  repeatMode: RepeatMode
  setRepeatMode: (mode: RepeatMode) => void
  shuffle: boolean
  setShuffle: (enabled: boolean) => void
  isPlaying: boolean
  setIsPlaying: (value: boolean) => void
  volume: number
  setVolume: (value: number) => void
  isMuted: boolean
  setIsMuted: (value: boolean) => void
  togglePlay: () => void
  progress: number
  setProgress: (value: number) => void
  duration: number
  setDuration: (value: number) => void
  audioRef: RefObject<HTMLAudioElement>
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null)

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext)
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider')
  }
  return context
}

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<TrackData | null>(null)
  const [queue, setQueue] = useState<TrackData[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [shuffle, setShuffle] = useState(false)

  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const playTrack = (track: TrackData, index?: number) => {
    const newPlayId = `${Date.now()}-${track._id}`
    const uniqueTrack = { ...track, playId: newPlayId }

    setCurrentTrack(uniqueTrack)
    if (index !== undefined) setCurrentIndex(index)

    if (track.slug) {
      const basePath = track.type === 'album' ? 'albums' : 'singles'
      const url = track.albumSlug
        ? `/music/${basePath}/${track.albumSlug}/${track.slug}`
        : `/music/${basePath}/${track.slug}`

      if (pathname !== url) {
        router.push(url, { scroll: false })
      }
    }
  }

  const clearTrack = () => {
    setCurrentTrack(null)
    setIsPlaying(false)
  }

  const playNext = () => {
    if (queue.length === 0) return

    let nextIndex = currentIndex + 1

    if (shuffle) {
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * queue.length)
      } while (queue.length > 1 && randomIndex === currentIndex)
      nextIndex = randomIndex
    }

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0
      } else {
        clearTrack()
        return
      }
    }

    playTrack(queue[nextIndex], nextIndex)
  }

  const playPrev = () => {
    if (queue.length === 0) return
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0
    playTrack(queue[prevIndex], prevIndex)
  }

  const togglePlay = () => {
    if (audioRef.current) {
      audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause()
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setProgress(audio.currentTime || 0)
      setDuration(audio.duration || 0)
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0
        audio.play()
      } else {
        playNext()
      }
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [repeatMode, queue, currentIndex, shuffle])

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        playTrack,
        clearTrack,
        playNext,
        playPrev,
        queue,
        setQueue,
        repeatMode,
        setRepeatMode,
        shuffle,
        setShuffle,
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        togglePlay,
        progress,
        setProgress,
        duration,
        setDuration,
        audioRef,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  )
}
