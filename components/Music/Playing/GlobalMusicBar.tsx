'use client'

import { useMusicPlayer } from './MusicPlayerContext'
import MiniFullscreenPlayer from './MiniFullscreenPlayer'
import {
  Pause, Play, SkipBack, SkipForward,
  Repeat, Shuffle, Volume2, VolumeX
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import clsx from 'clsx'

export default function GlobalMusicBar() {
  const {
    currentTrack,
    playNext,
    playPrev,
    queue,
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
    progress,
    setProgress,
    duration,
    setDuration,
    audioRef
  } = useMusicPlayer()

  const [signedUrl, setSignedUrl] = useState('')
  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [showBar, setShowBar] = useState(true)
  const [showMiniPlayer, setShowMiniPlayer] = useState(false)

  const currentIndex = queue.findIndex(t => t._id === currentTrack?._id)

  useEffect(() => {
    if (currentTrack) setShowBar(true)
  }, [currentTrack])

  useEffect(() => {
    const finalUrl = currentTrack?.r2FileUrlmp3 || currentTrack?.r2FileUrl
    if (!finalUrl) return
  
    const key = finalUrl.split('/').slice(4).join('/')
    const fetchSignedUrl = async () => {
      try {
        const res = await fetch('/api/r2-music-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        })
        const data = await res.json()
        if (!data.signedUrl) throw new Error('No signed URL returned')
        setSignedUrl(data.signedUrl)
      } catch (err: any) {
        toast.error('Failed to load music')
        console.error('🎵 R2 Stream Error:', err.message)
      }
    }
    fetchSignedUrl()
  }, [currentTrack?.r2FileUrlmp3, currentTrack?.r2FileUrl])
  

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setProgress(audio.currentTime)
        setDuration(audio.duration)
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [signedUrl, isSeeking])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    isPlaying ? audio.pause() : audio.play()
  }

  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current?.play()
    } else {
      playNext()
    }
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const min = Math.floor(time / 60)
    const sec = Math.floor(time % 60)
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  if (!currentTrack || !showBar) return null

  return (
    <div className="fixed bottom-0 left-0 w-full z-[1000] bg-neutral-900 border-t border-neutral-800 shadow-inner lg:mb-0 sm:mb-0 mb-16">
      {signedUrl && (
        <audio ref={audioRef} src={signedUrl} autoPlay onEnded={handleEnded} />
      )}
      {/* Progress Bar */}
      <div className="w-full px-4 pt-1 mb-1">
        <div className="relative w-full h-[6px] bg-gray-600 rounded-full">
        <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={isSeeking ? seekValue : progress}
            onInput={(e) => {
              const val = parseFloat((e.target as HTMLInputElement).value)
              setSeekValue(val)
              setProgress(val)
              if (audioRef.current) audioRef.current.currentTime = val
            }}
            onChange={(e) => setSeekValue(parseFloat(e.target.value))}
            onMouseDown={() => setIsSeeking(true)}
            onTouchStart={() => setIsSeeking(true)}
            onMouseUp={() => setIsSeeking(false)}
            onTouchEnd={() => setIsSeeking(false)}
            className="progress-slider absolute top-0 left-0 z-10 w-full h-[10px] cursor-pointer touch-none"
          />

          <div
            className="h-full bg-red-800 rounded-full"
            style={{ width: `${((isSeeking ? seekValue : progress) / duration) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-[11px] px-4 text-gray-400 mb-1">
        <span>{formatTime(isSeeking ? seekValue : progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Main Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 max-w-6xl mx-auto overflow-hidden">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink">
          {currentTrack.track.coverImageUrl && (
            <Image
              src={currentTrack.track.coverImageUrl}
              alt={currentTrack.track.title}
              width={44}
              height={44}
              className="rounded-md object-cover flex-shrink-0"
            />
          )}
          <div className="text-white overflow-hidden">
          <p className="text-sm font-medium truncate max-w-[180px] sm:max-w-[250px]">
              {currentTrack.slug ? (
                <Link
                  href={
                    currentTrack.type === 'album' && currentTrack.albumSlug
                      ? `/music/albums/${currentTrack.albumSlug}/${currentTrack.slug}`
                      : `/music/singles/${currentTrack.slug}`
                  }
                  className="hover:underline"
                >
                  {currentTrack.track.title}
                </Link>
              ) : (
                currentTrack.track.title
              )}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">
              {currentTrack.track.artist}
            </p>
        {currentTrack.r2FileUrlmp3 ? (
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="MP3" />
        ) : (
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" title="WAV" />
        )}


          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 text-white">
          <button
            onClick={playPrev}
            disabled={currentIndex <= 0}
            className={clsx(currentIndex <= 0 && 'opacity-50 cursor-not-allowed')}
          >
            <SkipBack size={20} />
          </button>
          <button onClick={togglePlay}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={playNext}
            disabled={currentIndex >= queue.length - 1}
            className={clsx(currentIndex >= queue.length - 1 && 'opacity-50 cursor-not-allowed')}
          >
            <SkipForward size={20} />
          </button>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => setShuffle(!shuffle)} className={shuffle ? 'text-red-800' : ''}>
              <Shuffle size={20} />
            </button>
            <button
              onClick={() =>
                setRepeatMode(repeatMode === 'off' ? 'one' : repeatMode === 'one' ? 'all' : 'off')
              }
              className={repeatMode !== 'off' ? 'text-red-800' : ''}
            >
              {repeatMode === 'one' ? <Repeat className="rotate-90" size={20} /> : <Repeat size={20} />}
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className={isMuted ? 'text-red-500' : ''}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onInput={(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))}
              className="w-[80px] accent-red-800 touch-none"
              />


          </div>
        </div>

        {/* Expand / Close Buttons */}
        <div className="flex items-center gap-4 ml-auto shrink-0">
          <button
            onClick={() => setShowMiniPlayer(true)}
            className="text-xs text-gray-400 hover:text-white transition block sm:hidden"
          >
            Expand
          </button>
          <button
            onClick={() => setShowBar(false)}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Close
          </button>
        </div>
      </div>

      <MiniFullscreenPlayer
        isOpen={showMiniPlayer}
        onClose={() => setShowMiniPlayer(false)}
      />
    </div>
  )
}
