"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import { Trash2, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { urlFor } from "@/app/utils/sanityClient"
import { Button } from "@/components/ui/button"
import FeedActions from "./FeedActions"
import FeedComments from "./FeedComments"
import LinkPreviewCard from "@/components/Feed/LinkPreviewCard"

interface FeedPost {
  linkPreview?: {
    title: string
    description: string
    image: string
    url: string
  }
  _id: string
  text?: string
  createdAt: string
  visibility: "public" | "followers"
  image?: any
  initiallyLiked: boolean
  likes: number
  author: {
    _id: string
    username: string
    profileImage?: any
  }
}

interface Props {
  post: FeedPost
  sessionUserId?: string
  onDelete?: (id: string) => void
}

export default function FeedPostCard({ post, sessionUserId, onDelete }: Props) {
  const { data: session } = useSession()
  const [showOptions, setShowOptions] = useState(false)
  const optionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false)
      }
    }

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showOptions])

  const handleDelete = async () => {
    const res = await fetch(`/api/feed/delete?postId=${post._id}`, {
      method: "DELETE",
    })
    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error || "Failed to delete post")
      return
    }

    toast.success("Post deleted")
    onDelete?.(post._id)
  }

  return (
    <div className="relative group border rounded-lg p-4 space-y-2 bg-white hover:shadow-md transition cursor-pointer">
      {/* Clickable top border bar */}
      <Link
        href={`/${post.author.username}/feed/${post._id}`}
        className="absolute top-0 left-0 w-full h-1 bg-black/60 group-hover:bg-black/40 z-10 transition-all rounded-t-lg"
        aria-label="View full post"
      />

      <div className="relative z-20 space-y-4">
        <div className="flex items-center gap-2">
          {post.author.profileImage && (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <Image
                src={urlFor(post.author.profileImage)}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          )}

          <Link
            href={`/${post.author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold hover:underline z-20"
          >
            {post.author.username}
          </Link>
          <Badge variant="outline">{post.visibility}</Badge>

          <span className="text-xs text-gray-400 ml-auto">
            {formatDistanceToNow(new Date(post.createdAt))} ago
          </span>

          {sessionUserId === post.author._id && (
            <div className="relative" ref={optionsRef}>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowOptions(!showOptions)
                }}
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-500"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              {showOptions && (
                <div className="absolute right-0 mt-2 bg-white border shadow-md rounded-md z-30">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                      setShowOptions(false)
                    }}
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 text-xs"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {post.text && <p className="text-sm text-gray-800">{post.text}</p>}

        {post.linkPreview && (
          <LinkPreviewCard
            title={post.linkPreview.title}
            description={post.linkPreview.description}
            image={post.linkPreview.image}
            url={post.linkPreview.url}
          />
        )}

        {post.image && (
          <Image
            src={urlFor(post.image)}
            alt="Post Image"
            width={800}
            height={500}
            className="rounded-lg"
          />
        )}

        <div className="flex justify-between items-center text-sm text-gray-500">
          <FeedActions
            postId={post._id}
            authorId={post.author._id}
            initialLikes={post.likes}
            initiallyLiked={post.initiallyLiked}
          />
        </div>

        <FeedComments feedPostId={post._id} />
      </div>
    </div>
  )
}
