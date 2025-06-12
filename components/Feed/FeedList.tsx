"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { client } from "@/app/utils/sanityClient"
import FeedPostCard from "@/components/Feed/FeedPost"
import AdBlock from "@/components/Ads/AdBlock"
import { RefreshCw, Users } from "lucide-react"

interface FeedPost {
  initiallyLiked: boolean
  likes: number
  likedBy: any
  linkPreview: any
  _id: string
  text?: string
  visibility: "public" | "followers"
  createdAt: string
  author: {
    _id: string
    username: string
    profileImage?: any
  }
  image?: any
}

interface FeedListProps {
  userId?: string
  limit?: number
}

export default function FeedList({ limit, userId }: FeedListProps) {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { data: session } = useSession()

  const fetchFeed = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)

    try {
      const url = userId ? `/api/feed/list?userId=${userId}` : `/api/feed/list`
      const res = await fetch(url)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      toast.error("Failed to load feed")
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [userId])

  const waitForPost = async (postId: string, tries = 5) => {
    for (let i = 0; i < tries; i++) {
      const res = await fetch("/api/feed/list")
      const data = await res.json()
      const exists = data.posts?.find((p: FeedPost) => p._id === postId)
      if (exists) return exists
      await new Promise((r) => setTimeout(r, 1000))
    }
    return null
  }

  useEffect(() => {
    const subscription = client
      .listen(`*[_type == "userFeed"] | order(_createdAt desc)[0]`)
      .subscribe(async (event) => {
        if (event.type === "mutation" && event.transition === "appear" && event.result) {
          const newPostId = event.result._id
          const confirmedPost = await waitForPost(newPostId)
          if (!confirmedPost) return
          setPosts((prev) => {
            const exists = prev.find((p) => p._id === newPostId)
            if (exists) return prev
            return [confirmedPost, ...prev]
          })
        }
      })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                <div className="bg-gray-200 h-3 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-200 h-4 rounded w-full"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Refresh button for feed */}
      {!userId && (
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Recent Posts</h3>
          <button
            onClick={() => fetchFeed(true)}
            disabled={refreshing}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">No posts yet</p>
          <p className="text-xs text-gray-400 mt-1">Be the first to share something!</p>
        </div>
      )}

      {posts.map((post, index) => (
        <div key={post._id}>
          <FeedPostCard
            post={post}
            sessionUserId={session?.user?.id}
            onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
          />
          {(index + 1) % 2 === 0 && limit && (
            <AdBlock adSlot="8397118667" className="my-4 rounded-xl overflow-hidden" />
          )}
        </div>
      ))}
    </div>
  )
}
