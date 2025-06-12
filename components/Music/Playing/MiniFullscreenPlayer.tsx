'use client'

import { useState, useEffect } from 'react'
import { useMusicPlayer } from './MusicPlayerContext'
import {
  Pause, Play, SkipBack, SkipForward,
  Repeat, Shuffle, Volume2, VolumeX, X
} from 'lucide-react'
import Image from 'next/image'
import clsx from 'clsx'

export default function MiniFullscreenPlayer({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const {
    currentTrack,
    queue,
    playNext,
    playPrev,
    isPlaying,
    togglePlay,
    repeatMode,
    setRepeatMode,
    shuffle,
    setShuffle,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    progress,
    duration,
    audioRef,
    setProgress,
  } = useMusicPlayer()

  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [isIOS, setIsIOS] = useState(false)
  const currentIndex = queue.findIndex((t) => t._id === currentTrack?._id)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
  }, [])

  // Volume control directly on global context
  const handleVolumeChange = (val: number) => {
    setVolume(val)
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : val
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = repeatMode === 'one'
    }
  }, [repeatMode])

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const min = Math.floor(time / 60)
    const sec = Math.floor(time % 60)
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  if (!isOpen || !currentTrack) return null

  return (
    <div className="fixed inset-0 z-[2000] bg-white flex flex-col items-center justify-between p-6 transition-all duration-300 ease-in-out overflow-y-auto">
      {/* Close */}
      <div className="w-full flex justify-end mb-2">
        <button onClick={onClose} className="text-gray-500 hover:text-black transition">
          <X size={28} />
        </button>
      </div>

      {/* Album Art */}
      {currentTrack.track.coverImageUrl && (
        <div className="w-[80%] max-w-xs aspect-square rounded-xl overflow-hidden shadow-xl mb-4">
          <Image
            src={currentTrack.track.coverImageUrl}
            alt={currentTrack.track.title}
            width={500}
            height={500}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Info */}
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-2xl font-bold truncate">{currentTrack.track.title}</h2>
        <p className="text-sm text-gray-500 truncate">{currentTrack.track.artist}</p>
        <div className="text-sm text-gray-500">
          {formatTime(progress)} / {formatTime(duration)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-6 w-full max-w-md">
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={playPrev}
            disabled={currentIndex <= 0}
            className={clsx(currentIndex <= 0 && 'opacity-50 cursor-not-allowed')}
          >
            <SkipBack size={28} />
          </button>
          <button
            onClick={togglePlay}
            className="bg-black text-white rounded-full p-3"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button
            onClick={playNext}
            disabled={currentIndex >= queue.length - 1}
            className={clsx(currentIndex >= queue.length - 1 && 'opacity-50 cursor-not-allowed')}
          >
            <SkipForward size={28} />
          </button>
        </div>

        <div className="flex justify-center items-center gap-6 text-gray-600">
          <button onClick={() => setShuffle(!shuffle)} className={clsx({ 'text-red-600': shuffle })}>
            <Shuffle size={22} />
          </button>
          <button
            onClick={() => setRepeatMode(
              repeatMode === 'off' ? 'one' : repeatMode === 'one' ? 'all' : 'off'
            )}
            className={clsx({ 'text-red-600': repeatMode !== 'off' })}
          >
            {repeatMode === 'one'
              ? <Repeat className="rotate-90" size={22} />
              : <Repeat size={22} />}
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className={clsx({ 'text-red-600': isMuted })}>
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
        </div>

          {/* Volume (desktop only) */}
          {!isIOS && (
            <>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-red-700"
            />
            <p className='text-center text-xs text-gray-500'>Volume {Math.round(volume * 100)}% </p>            

            </>
          )}
          {isIOS && (
            <p className="text-center text-xs text-gray-500">
              Use your iPhone volume buttons to adjust audio.
            </p>
          )}

      </div>

      {/* Seek Bar */}
      <div className="w-full">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={isSeeking ? seekValue : progress}
          onChange={(e) => setSeekValue(parseFloat(e.target.value))}
          onMouseDown={() => setIsSeeking(true)}
          onTouchStart={() => setIsSeeking(true)}
          onMouseUp={() => {
            setIsSeeking(false)
            setProgress(seekValue)
            if (audioRef.current) audioRef.current.currentTime = seekValue
          }}
          onTouchEnd={() => {
            setIsSeeking(false)
            setProgress(seekValue)
            if (audioRef.current) audioRef.current.currentTime = seekValue
          }}
          className="w-full accent-red-700 touch-none"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>{formatTime(isSeeking ? seekValue : progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
