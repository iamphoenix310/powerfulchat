"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { urlFor } from "@/app/utils/sanityClient"
import { motion } from "framer-motion"
import type { PremiumItem } from "./PremiumContent"

interface PremiumGridProps {
  items: PremiumItem[]
}

export default function PremiumGrid({ items }: PremiumGridProps) {
  return (
    <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 w-full">
      {items.map((item) => (
        <PremiumCard key={item._id} item={item} />
      ))}
    </div>
  )
}

function PremiumCard({ item }: { item: PremiumItem }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/images/${item.slug.current}`} className="block group">
        <div className="relative w-full pt-[133.33%]">
          {/* Main Image */}
          <Image
            src={
              urlFor(item.image, {
                width: 800,
                height: 1200,
                highQuality: true,
              }) || "/placeholder.svg"
            }
            alt={item.title}
            fill
            className="absolute inset-0 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Watermark logo */}
          <div className="absolute top-2 right-2 z-10 opacity-60 group-hover:opacity-80 transition">
            <Image
              src="/logo-watermark.png" // ⬅️ Replace with your actual transparent logo path
              alt="Watermark"
              width={30}
              height={30}
              className="pointer-events-none select-none"
            />
          </div>

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

          {/* Title + Price + Creator */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold text-lg md:text-xl truncate">
              {item.title}
            </h3>

            <div className="flex justify-between items-center mt-2">
              <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-md text-sm md:text-base font-medium">
                ₹{item.price || 0}
              </span>
              {item.creator && (
                <span className="text-xs md:text-sm text-gray-200">
                  by{" "}
                  <Link
                    href={`/${item.creator.username}`}
                    className="text-emerald-500 hover:underline"
                  >
                    {item.creator.username}
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
