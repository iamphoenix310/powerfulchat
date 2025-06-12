"use client"

import { urlFor } from "@/app/utils/sanityClient"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Download, History, ImagePlus } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"

function getAspectClass(width: number, height: number) {
  if (!width || !height) return "1 / 1"
  const ratio = width / height
  if (Math.abs(ratio - 1) < 0.05) return "1 / 1"
  if (ratio < 1) return "3 / 4"
  if (ratio > 1.7) return "16 / 9"
  return "4 / 3"
}

interface BgRemovedHistoryProps {
  images: any[]
  loading: boolean
  initialCount?: number
  batchSize?: number
}

export default function BgRemovedHistory({
  images,
  loading,
  initialCount = 12,
  batchSize = 12,
}: BgRemovedHistoryProps) {
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

  const handleDownload = async (img: any) => {
    const toastId = toast.loading("Preparing download...")
    try {
      const imageUrl = urlFor(img.image)
      const filename = img.originalFilename?.replace(/\.[^/.]+$/, "") + "-no-bg.png" || "bg-removed.png"

      const link = document.createElement("a")
      link.href = imageUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Download started", { id: toastId })
    } catch (error) {
      toast.error("Download failed", { id: toastId })
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading your processed images...</p>
        </CardContent>
      </Card>
    )
  }

  if (!images?.length) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <ImagePlus className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No processed images yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You haven't removed any backgrounds yet. Upload an image above to get started!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          Your Processed Images ({images.length} images)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.slice(0, visibleCount).map((img, index) => {
            const meta = img?.image?.asset || img?.image
            const width = meta?.metadata?.dimensions?.width || 400
            const height = meta?.metadata?.dimensions?.height || 400

            return (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border-0 shadow-sm">
                  <div
                    className="relative w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
                    style={{
                      aspectRatio: getAspectClass(width, height),
                      minHeight: 200,
                    }}
                  >
                    {/* Transparency checker pattern */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='10' height='10' fill='%23000'/%3e%3crect x='10' y='10' width='10' height='10' fill='%23000'/%3e%3c/svg%3e")`,
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <Image
                      src={urlFor(img.image) || "/placeholder.svg"}
                      alt={img.originalFilename || "Background removed image"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                      unoptimized
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=400"
                        ;(e.target as HTMLImageElement).alt = "Image failed to load"
                      }}
                    />
                  </div>

                  <CardHeader className="p-4 space-y-2">
                    <CardTitle className="text-sm font-medium line-clamp-2 leading-tight">
                      {img.originalFilename || "Untitled Image"}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        Background Removed
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {img.processedAt
                          ? new Date(img.processedAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "Unknown date"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardFooter className="p-4 mt-auto border-t">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(img)} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download PNG
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
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
