"use client"

import FeedPostCard from "@/components/Feed/FeedPost"
import { useState } from "react"
import type { FeedPost } from "./types"

interface Props {
  post: FeedPost
  sessionUserId?: string
}

export default function FeedPostCardClient({ post, sessionUserId }: Props) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <FeedPostCard
      post={post}
      sessionUserId={sessionUserId}
      onDelete={() => setVisible(false)}
    />
  )
}
