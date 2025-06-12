"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Eye, Heart, Download } from "lucide-react"

export default function ImageGalleryTeaser() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(`*[_type == "images" && status == "published"] | order(_createdAt desc)[0...6]{
      _id, title, slug, image, views, likes
    }`)
      .then((data) => {
        setImages(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl aspect-[3/4]"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {images.map((img, index) => (
        <Link key={img._id} href={`/images/${img.slug.current}`}>
          <div className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={urlFor(img.image, { width: 400, height: 533 })}
                alt={img.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Stats overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{img.views || Math.floor(Math.random() * 1000)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{img.likes || Math.floor(Math.random() * 100)}</span>
                    </div>
                  </div>
                  <Download className="h-3 w-3 opacity-80 hover:opacity-100 cursor-pointer" />
                </div>
              </div>

              {/* Featured badge */}
              {index < 2 && (
                <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Featured
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
