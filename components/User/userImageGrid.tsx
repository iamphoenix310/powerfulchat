'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import ImageCard from '@/components/ImageDetails/imageCard'

interface ImageDetail {
  _id: string
  title: string
  slug: { current: string }
  image: any
  alt?: string
  description: string
  tags: string[]
}

interface UserImageGridProps {
  images: ImageDetail[]
}

const BATCH_SIZE = 8

const UserImageGrid: React.FC<UserImageGridProps> = ({ images }) => {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && visibleCount < images.length) {
        setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, images.length))
      }
    },
    [visibleCount, images.length]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '0px',
      threshold: 1.0,
    })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [handleObserver])

  if (!images || images.length === 0) {
    return <p className="text-gray-500">No images uploaded yet.</p>
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.slice(0, visibleCount).map((img) => (
          <ImageCard key={img._id} image={img} />
        ))}
      </div>

      {/* Loader */}
      {visibleCount < images.length && (
        <div ref={loaderRef} className="mt-6 text-center text-sm text-gray-400">
          Loading more...
        </div>
      )}
    </>
  )
}

export default UserImageGrid
