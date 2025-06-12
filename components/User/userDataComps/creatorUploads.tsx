'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { getCreatorImages } from '@/app/actions/userData/getCreatorImages'
import { urlFor } from '@/app/utils/sanityClient'
import Link from 'next/link'

const ITEMS_PER_PAGE = 8

const CreatorUploads = () => {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    getCreatorImages().then((data) => {
      const sorted = [...data].sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      setImages(sorted)
      setLoading(false)
    })
  }, [])

  if (loading) return <p>Loading...</p>

  const totalSales = images.reduce((acc, img) => {
    return acc + (img.downloads || 0) * (img.price || 0)
  }, 0)

  const creatorProfit = totalSales * 0.95

  const sortedImages = [...images].sort((a, b) => {
    const aDownloads = a.downloads || 0
    const bDownloads = b.downloads || 0
    return bDownloads - aDownloads
  })

  const paginated = sortedImages.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(sortedImages.length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-8">
      {/* 💰 Summary */}
      <div className="bg-blue-50 p-4 rounded-md mb-6 shadow text-blue-800 font-semibold">
        <p>Total Sales: ₹{totalSales}</p>
        <p>Your Profit (95%): ₹{creatorProfit}</p>
      </div>

      {/* 📸 Uploads Grid */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 tracking-tight relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-gradient-to-r before:from-blue-500 before:to-purple-500">
        <span className="relative z-10">Your Uploads</span>
        <span className="absolute top-0 left-0 w-full h-full text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 z-0">
          Your Uploads
        </span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginated.map((img) => (
          <Link href={`/images/${img.slug?.current}`} key={img._id}>
            <div className="border rounded-xl p-2 bg-white shadow-md">
              <Image
                src={urlFor(img.image)}
                alt={img.title}
                width={300}
                height={400}
                className="rounded-lg"
              />
              <div className="mt-2 text-sm">
                <p className="font-semibold">{img.title}</p>
                <p className="text-gray-500">Views: {img.views || 0}</p>
                <p className="text-gray-500">Likes: {img.likes || 0}</p>
                <p className="text-gray-500">
                  {img.isPremium ? `Sales: ${img.downloads || 0}` : `Downloads: ${img.downloads || 0}`}
                </p>

                {img.isPremium && (
                  <>
                    <p className="text-green-600">Premium • ₹{img.price}</p>
                    <p className="text-gray-500">
                      Revenue: ₹{((img.downloads || 0) * (img.price || 0)).toFixed(2)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 🔄 Responsive Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-6 px-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`min-w-[36px] px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                page === i + 1
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CreatorUploads