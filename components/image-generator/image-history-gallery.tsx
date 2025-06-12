"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History, ImagePlus, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ImageHistoryCard } from "./image-history-card"

interface ImageHistoryGalleryProps {
  images: any[]
  currentUserId?: string
  refetch?: () => void
  emptyText?: string
  onSwitchToCreate?: () => void
  initialCount?: number
  batchSize?: number
}

export function ImageHistoryGallery({
  images,
  currentUserId,
  refetch,
  emptyText = "No images yet",
  onSwitchToCreate,
  initialCount = 12,
  batchSize = 12,
}: ImageHistoryGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + batchSize, images.length))
        }
      },
      { threshold: 1 },
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [images.length, batchSize])

  useEffect(() => {
    setVisibleCount(initialCount)
  }, [images, initialCount])

  if (!images?.length) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <ImagePlus className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{emptyText}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You haven&apos;t generated any images yet. Start creating your first AI masterpiece with MiniMax!
          </p>
          {onSwitchToCreate && (
            <Button
              onClick={onSwitchToCreate}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Your First Image
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          Your Generation History ({images.length} images)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.slice(0, visibleCount).map((img) => (
            <ImageHistoryCard key={img._id} img={img} currentUserId={currentUserId} refetch={refetch} />
          ))}
        </div>
        {visibleCount < images.length && (
          <div ref={loaderRef} className="w-full flex justify-center py-6">
            <span className="text-xs text-muted-foreground animate-pulse">Loading more images...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
