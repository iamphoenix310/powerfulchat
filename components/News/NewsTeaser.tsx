"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Calendar, Clock } from "lucide-react"

export default function NewsTeaser() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(`*[_type == "articles"] | order(publishedAt desc)[0...4]{
        _id,
        title,
        slug,
        publishedAt,
        mainImage,
        excerpt
      }`)
      .then((data) => {
        setArticles(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="bg-gray-200 rounded-xl w-20 h-16 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="bg-gray-200 h-4 rounded w-full"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <Link
          href={`/news/${article.slug.current}`}
          key={article._id}
          className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-200"
        >
          <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={
                article.mainImage ? urlFor(article.mainImage, { width: 200, height: 150, crop: true }) : "/no-image.jpg"
              }
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {index === 0 && (
              <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">
                HOT
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1">
              {article.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <Clock className="h-3 w-3 ml-1" />
              <span>2 min read</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
