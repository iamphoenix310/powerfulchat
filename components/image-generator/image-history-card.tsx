"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Download, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface ImageCardProps {
  img: {
    _id: string
    imageUrl: string
    prompt: string
    aspectRatio?: string
    model: string
    _createdAt?: string
    status?: "draft" | "published"
    user?: { _ref: string }
  }
  currentUserId?: string
  refetch?: () => void
}

async function downloadImage(url: string, filename = "download.jpg") {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`)
    const blob = await res.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error("Download error:", error)
    toast.error("Download failed. Check console for details.")
    throw error
  }
}

const parseAspectRatioForCss = (aspectRatioString?: string): string => {
  if (!aspectRatioString) return "1 / 1"
  if (aspectRatioString.includes(":")) {
    const parts = aspectRatioString.split(":")
    if (parts.length === 2) {
      const num1 = Number.parseFloat(parts[0])
      const num2 = Number.parseFloat(parts[1])
      if (!isNaN(num1) && !isNaN(num2) && num1 > 0 && num2 > 0) {
        return `${num1} / ${num2}`
      }
    }
  } else if (aspectRatioString.includes("x")) {
    const parts = aspectRatioString.split("x")
    if (parts.length === 2) {
      const num1 = Number.parseFloat(parts[0])
      const num2 = Number.parseFloat(parts[1])
      if (!isNaN(num1) && !isNaN(num2) && num1 > 0 && num2 > 0) {
        return `${num1} / ${num2}`
      }
    }
  }
  return "1 / 1"
}

export function ImageHistoryCard({ img, refetch, currentUserId }: ImageCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting image...")
    setDeleting(true)
    try {
      const res = await fetch("/api/delete-generated-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: img._id }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to delete" }))
        throw new Error(errorData.message || "Failed to delete")
      }
      toast.success("Image deleted", { id: toastId })
      refetch?.()
    } catch (error: any) {
      toast.error(error.message || "Error deleting image", { id: toastId })
    } finally {
      setDeleting(false)
    }
  }

  const isPublished = img.status === "published"

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border-0 shadow-sm">
        <div
          className="relative w-full overflow-hidden bg-muted"
          style={{
            aspectRatio: parseAspectRatioForCss(img.aspectRatio),
            minHeight: 200,
          }}
        >
          <Image
            src={img.imageUrl || "/placeholder.svg"}
            alt={img.prompt || "Generated image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            unoptimized
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=400"
              ;(e.target as HTMLImageElement).alt = "Image failed to load"
            }}
          />
        </div>

        <CardHeader className="p-4 space-y-2">
          <CardTitle className="text-sm font-medium line-clamp-2 leading-tight">
            {img.prompt || "Untitled Image"}
          </CardTitle>
          <div className="flex items-center justify-between">
            <Badge variant={isPublished ? "default" : "secondary"} className="text-xs">
              {isPublished ? "Published" : "MiniMax"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(img._createdAt || Date.now()).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        </CardHeader>

        <CardFooter className="p-4 mt-auto border-t">
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={async () => {
                const toastId = toast.loading("Preparing download...")
                try {
                  await downloadImage(img.imageUrl, `image-${img._id || "download"}.jpg`)
                  toast.success("Download started", { id: toastId })
                } catch (err) {
                  // Error already handled in downloadImage
                }
              }}
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>

            {isPublished ? (
              <Button disabled variant="secondary" size="sm" className="text-xs cursor-not-allowed">
                Published
              </Button>
            ) : (
              <Button asChild variant="default" size="sm" className="text-xs">
                <Link href={`/publish/${img._id}`}>
                  <Upload className="w-3 h-3 mr-1" />
                  Publish
                </Link>
              </Button>
            )}

            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="text-xs">
              <Trash2 className="w-3 h-3 mr-1" />
              {deleting ? "..." : "Delete"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
