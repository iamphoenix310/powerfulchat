'use client'

import { useSanityUserId } from '@/app/lib/hooks/useSanityUserId'
import { HeartIcon as OutlineHeart } from '@heroicons/react/24/outline'
import { HeartIcon as SolidHeart } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'react-toastify'

interface LikeButtonProps {
  imageId: string
  likes: number
  likedBy: { _ref: string }[]
  onLikeToggle?: (liked: boolean, newLikes: number, userId: string) => void
}

export default function LikeButton({ imageId, likes, likedBy, onLikeToggle }: LikeButtonProps) {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const [animate, setAnimate] = useState(false)

  const { userId, loading } = useSanityUserId()
  const [localLiked, setLocalLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(likes)
  const [trustedUpdate, setTrustedUpdate] = useState(false)
  
  useEffect(() => {
    setLocalLikes(likes)
  }, [likes])
  

  useEffect(() => {
    if (!userId || trustedUpdate) return
    const userHasLiked = likedBy.some((ref) => ref._ref === userId)
    setLocalLiked(userHasLiked)
  }, [userId, likedBy, trustedUpdate])
  

  useEffect(() => {
    if (!userId || !imageId) return
  
    const fetchLikes = async () => {
      try {
        const res = await fetch('/api/image-likes/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId }),
          cache: 'no-store',
        })
  
        const data = await res.json()
  
        if (data.success) {
          setLocalLikes(data.likes)
          const userHasLiked = Array.isArray(data.likedBy) && data.likedBy.some((ref: { _id: string }) => ref._id === userId)
          setLocalLiked(userHasLiked)
        }

      } catch (error) {
        console.error('❌ Failed to fetch live likes:', error)
      }
    }
  
    fetchLikes()
  }, [userId, imageId])
  

  

  const toggleLike = async () => {
    if (!session) {
      toast.info('Please sign in to like this image.')
      return
    }
  
    const endpoint = localLiked ? '/api/unlike-image' : '/api/image-likes'
  
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId, userId }),
    })
  
    const data = await res.json()
  
    if (data.success) {
      setLocalLiked(!localLiked)
      setLocalLikes(data.likes)
      if (onLikeToggle) {
        onLikeToggle(!localLiked, data.likes, userId)
      }
    } else {
      toast.error(data.message || 'Error updating like')
    }
  }
  

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <OutlineHeart className="w-7 h-7 text-gray-300 animate-pulse" />
        <span className="text-sm text-gray-400">--</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleLike}
        disabled={isPending}
        aria-label="Like image"
        className={clsx('transition-transform duration-300 focus:outline-none', animate && 'scale-125')}
      >
        {localLiked ? (
          <SolidHeart className="w-7 h-7 text-red-500" />
        ) : (
          <OutlineHeart className="w-7 h-7 text-gray-600 hover:text-red-400" />
        )}
      </button>
      <span className="text-sm text-gray-700">{localLikes}</span>
    </div>
  )
}
