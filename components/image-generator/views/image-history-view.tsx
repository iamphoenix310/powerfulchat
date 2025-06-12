"use client"

import { useGeneratedImages } from "@/app/lib/hooks/generatedImages"
import type { Session } from "next-auth"
import { ImageHistoryGallery } from "../image-history-gallery"

interface ImageHistoryViewProps {
  session: Session | null
}

export function ImageHistoryView({ session }: ImageHistoryViewProps) {
  const { images: generatedImages = [], refetch: refetchGeneratedImages } = useGeneratedImages(session?.user?.id || "")

  return (
    <div className="space-y-6">
      <ImageHistoryGallery
        images={generatedImages}
        currentUserId={session?.user?.id}
        refetch={refetchGeneratedImages}
        emptyText="No images in your gallery yet"
      />
    </div>
  )
}
