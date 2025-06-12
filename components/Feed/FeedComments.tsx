"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { urlFor } from "@/app/utils/sanityClient"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, MessageCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

interface Comment {
  _id: string
  text: string
  _createdAt: string
  parent?: { _ref: string }
  user: {
    _id: string
    username: string
    name?: string
    profileImage?: any
  }
  replies?: Comment[]
}

interface Props {
  feedPostId: string
}

export default function FeedComments({ feedPostId }: Props) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const commentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (expanded) fetchComments()
  }, [expanded])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commentRef.current && !commentRef.current.contains(event.target as Node)) {
        setExpanded(false)
        setReplyTo(null)
        setShowAll(false)
      }
    }

    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [expanded])

  const fetchComments = async () => {
    const res = await fetch(`/api/feed/comments?postId=${feedPostId}`)
    const data = await res.json()
    setComments(data.comments || [])
  }

  const waitForComment = async (commentId: string, tries = 5): Promise<Comment | null> => {
    for (let i = 0; i < tries; i++) {
      const res = await fetch(`/api/feed/comments?postId=${feedPostId}`)
      const data = await res.json()
      const found = data.comments?.find((c: Comment) => c._id === commentId)
      if (found?.user?.username) return found
      await new Promise((r) => setTimeout(r, 1000))
    }
    return null
  }

  const handlePost = async () => {
    if (!text.trim()) return
    setLoading(true)

    const res = await fetch("/api/feed/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: feedPostId, text, parentId: replyTo }),
    })

    if (res.ok) {
      const { _id } = await res.json()
      const confirmed = await waitForComment(_id)
      if (!confirmed) {
        toast.error("Failed to sync comment.")
        return
      }

      setComments((prev) =>
        replyTo
          ? prev.map((c) =>
              c._id === replyTo
                ? { ...c, replies: [...(c.replies || []), confirmed] }
                : c
            )
          : [...prev, { ...confirmed, replies: [] }]
      )

      setText("")
      setReplyTo(null)
    } else {
      toast.error("Failed to post comment")
    }

    setLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    const res = await fetch(`/api/feed/comments/delete?commentId=${commentId}`, {
      method: "DELETE",
    })
    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error || "Failed to delete comment")
      return
    }

    setComments((prev) =>
      prev
        .filter((c) => c._id !== commentId)
        .map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r._id !== commentId) || [],
        }))
    )

    toast.success("Comment deleted")
  }

  const renderComment = (comment: Comment, depth = 0) => {
    const user = comment.user
    if (!user || !user.username) return null

    return (
      <div
        key={comment._id}
        className={cn("pt-4", depth > 0 && "ml-6 border-l border-gray-100 pl-4")}
      >
        <div className="flex gap-3 items-start">
          <Image
            src={user.profileImage ? urlFor(user.profileImage) : "/default-avatar.png"}
            alt="User"
            width={36}
            height={36}
            className="rounded-full object-cover w-9 h-9"
          />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/${user.username}`} className="font-medium text-sm hover:underline">
                {user.name || `@${user.username}`}
              </Link>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment._createdAt))} ago
              </span>
            </div>
            <p className="text-sm mt-1 text-gray-800">{comment.text}</p>

            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <button onClick={() => setReplyTo(comment._id)} className="hover:underline">
                Reply
              </button>
              {session?.user?.id === user._id && (
                <button onClick={() => handleDelete(comment._id)} className="text-red-500 hover:underline">
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {comment.replies?.map((child) => renderComment(child, depth + 1))}
      </div>
    )
  }

  const visibleComments = showAll ? comments : comments.slice(0, 2)

  return (
    <div className="pt-4 border-t mt-4" ref={commentRef}>
      {!expanded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <MessageCircle className="w-4 h-4" />
          View Comments ({comments.length})
        </Button>
      )}

      {expanded && (
        <div className="space-y-6">
          <div className="space-y-3 mb-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={replyTo ? "Write your reply..." : "Add a comment..."}
              className="resize-none text-base"
            />
            <div className="flex justify-between items-center">
              {replyTo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  className="text-xs"
                >
                  Cancel Reply
                </Button>
              )}
              <Button size="sm" onClick={handlePost} disabled={loading}>
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>

          {visibleComments.length > 0 ? (
            visibleComments.map((comment) => renderComment(comment))
          ) : (
            <p className="text-sm text-gray-500 italic">No comments yet.</p>
          )}

          {comments.length > 2 && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
              className="text-xs text-gray-600 hover:text-black"
            >
              Show all comments ({comments.length})
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
