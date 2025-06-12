"use client"

import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Download } from "lucide-react"
import Image from "next/image"
import { toast } from "react-hot-toast"

const fallbackImage = "/placeholder.svg?height=512&width=512"

interface GeneratedImagesProps {
  images: { url: string; aspectRatio: string }[]
  prompt: string
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
  }
  return "1 / 1"
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

export function GeneratedImages({ images, prompt }: GeneratedImagesProps) {
  if (!images || images.length === 0) return null

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {images.map((img, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
            <div
              className="relative w-full overflow-hidden bg-muted"
              style={{
                aspectRatio: parseAspectRatioForCss(img.aspectRatio),
              }}
            >
              <Image
                src={img.url || fallbackImage}
                alt={`Generated Image ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                unoptimized
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = fallbackImage
                  ;(e.target as HTMLImageElement).alt = "Image failed to load"
                }}
              />
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium line-clamp-2">{prompt || "Generated Image"}</CardTitle>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const toastId = toast.loading("Preparing download...")
                  try {
                    await downloadImage(img.url, `generated-${idx + 1}.jpg`)
                    toast.success("Download started", { id: toastId })
                  } catch (err) {
                    // Error already handled in downloadImage
                  }
                }}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
