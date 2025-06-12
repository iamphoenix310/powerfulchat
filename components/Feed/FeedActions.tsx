"use client"

import { useState, useEffect, useCallback } from "react"
import { Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

interface Props {
  postId: string
  authorId: string
  initialLikes: number
  initiallyLiked: boolean
}

export default function FeedActions({ postId, authorId, initialLikes, initiallyLiked }: Props) {
  const { data: session } = useSession()
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(initiallyLiked)
  const [isLoading, setIsLoading] = useState(false)

  const cleanPostId = postId.replace(/^drafts\./, "")
  const userId = session?.user?.id?.replace(/^drafts\./, "")

  const fetchLikeStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/feed/postforlike?id=${cleanPostId}`)
      const data = await res.json()
      if (typeof data.likes === "number" && typeof data.likedByUser === "boolean") {
        setLikes(data.likes)
        setLiked(data.likedByUser)
      }
    } catch (err) {
      console.error("fetchLikeStatus error:", err)
    }
  }, [cleanPostId])

  const likePost = async () => {
    if (!userId || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/feed/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: cleanPostId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLikes(data.likes)
      setLiked(true)
    } catch (err: any) {
      toast.error(err.message || "Failed to like")
    } finally {
      setIsLoading(false)
    }
  }

  const unlikePost = async () => {
    if (!userId || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/feed/unlike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: cleanPostId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLikes(data.likes)
      setLiked(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to unlike")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLikeStatus()
  }, [fetchLikeStatus])

  return (
    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
      <button
        onClick={liked ? unlikePost : likePost}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-1 transition-all duration-300",
          liked && "text-red-600",
          isLoading && "opacity-70 cursor-not-allowed"
        )}
        aria-label={liked ? "Unlike post" : "Like post"}
      >
        <Heart
          className={cn(
            "w-5 h-5",
            liked ? "fill-red-500 text-red-600" : "text-gray-500"
          )}
        />
        <span>{likes}</span>
      </button>
    </div>
  )
}
