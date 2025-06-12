"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { ImageIcon, Users, X } from "lucide-react"
import LinkPreviewCard from "@/components/Feed/LinkPreviewCard"

interface Props {
  onPosted?: () => void
}

export default function PostComposer({ onPosted }: Props) {
  const { data: session } = useSession()

  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [visibility, setVisibility] = useState<"public" | "followers">("public")
  const [posting, setPosting] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [ogPreview, setOgPreview] = useState<null | {
    title: string
    description: string
    image: string
    url: string
  }>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [text])

  // OG auto-fetch on URL paste
  useEffect(() => {
    const match = text.match(/https?:\/\/[^\s]+/)
    const url = match?.[0]

    if (!url || ogPreview?.url === url) return

    const autoFetch = async () => {
      try {
        const res = await fetch(`/api/feed/og-preview?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        if (data?.title) {
          setOgPreview(data)
        }
      } catch {
        // silently fail
      }
    }

    autoFetch()
  }, [text, ogPreview])

  const handlePost = async () => {
    if (!text && !file) return toast.error("Add some text or an image")

    setPosting(true)
    const formData = new FormData()
    formData.append("text", text)
    formData.append("visibility", visibility)
    if (file) formData.append("image", file)

    if (ogPreview) {
      formData.append("linkPreview", JSON.stringify(ogPreview))
    }

    const res = await fetch("/api/feed/post", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      toast.error("Failed to post")
      setPosting(false)
      return
    }

    setText("")
    setFile(null)
    setOgPreview(null)
    toast.success("Posted!")
    setPosting(false)
    onPosted?.()
  }

  if (!session?.user?.id) {
    return (
      <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">Please log in to post to the feed.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {session.user?.name?.[0] || "U"}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">{session.user?.name}</p>
            <p className="text-xs text-gray-500">Share your thoughts...</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="resize-none border-0 p-0 text-base placeholder:text-gray-400 focus:ring-0 min-h-[60px] max-h-[200px]"
          maxLength={280}
        />

        {/* Character count */}
        <div className="flex justify-end">
          <span className={`text-xs ${text.length > 250 ? "text-red-500" : "text-gray-400"}`}>{text.length}/280</span>
        </div>

        {/* File preview */}
        {file && (
          <div className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 flex-1">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Link preview */}
        {ogPreview && (
          <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setOgPreview(null)}
              className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500 border border-gray-200 rounded-full p-1 shadow-sm transition-colors"
              aria-label="Remove preview"
            >
              <X className="h-3 w-3" />
            </button>

            <LinkPreviewCard
              title={ogPreview.title}
              description={ogPreview.description}
              image={ogPreview.image}
              url={ogPreview.url}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => inputRef.current?.click()}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Photo
            </Button>

            <select
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
            >
              <option value="public">🌍 Public</option>
              <option value="followers">👥 Followers</option>
            </select>
          </div>

          <Button
            size="sm"
            onClick={handlePost}
            disabled={posting || (!text && !file)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Posting...
              </div>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>

      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setFile(e.target.files[0])
          }
        }}
      />
    </div>
  )
}
