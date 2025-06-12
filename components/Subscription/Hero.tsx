"use client"

import { client, urlFor } from "@/app/utils/sanityClient"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

interface ImageType {
  _id: string
  title: string
  image: any
  slug: { current: string }
}

export default function SubscriptionHero() {
  const [images, setImages] = useState<ImageType[]>([])

  useEffect(() => {
    // Fetch 5 latest images for the hero display
    client
      .fetch(
        `*[_type == "images"] | order(_createdAt desc)[0...5]{
          _id, title, image, slug
        }`
      )
      .then((result) => setImages(result))
      .catch((err) => {
        // Just in case Sanity isn't connected, don't break hero section
        setImages([])
      })
  }, [])

  // Floating effect only the first 5 (or fewer if mobile)
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768
  const visibleImages = isMobile ? images.slice(0, 2) : images.slice(0, 5)

  return (
    <>
    <section className="text-white py-16 px-4 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-x-hidden">
      {/* Floating Images Row */}
      <div className="flex justify-center gap-4 md:gap-6 mb-14 md:mb-20 px-4 pt-6 pb-10 overflow-x-auto w-full no-scrollbar z-10">
        <div className="flex space-x-4 md:space-x-6">
          {visibleImages.map((img, idx) => (
            <motion.div
              key={img._id}
              className="relative w-28 h-40 md:w-40 md:h-60 lg:w-56 lg:h-80 rounded-xl overflow-hidden shadow-xl bg-white/5"
              animate={{ y: [0, -22, 0] }}
              transition={{
                duration: 4 + idx * 0.4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.08 }}
            >
              <Link href={`/images/${img.slug.current}`} className="block w-full h-full">
                <Image
                  src={urlFor(img.image)}
                  alt={img.title}
                  fill
                  className="object-cover rounded-xl pointer-events-auto"
                  sizes="(max-width: 768px) 100px, (max-width: 1200px) 180px, 240px"
                  priority
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="absolute bottom-2 right-2 z-10 opacity-60 pointer-events-none">
                  <Image
                    src="/logo-watermark.png"
                    alt="Watermark"
                    width={34}
                    height={34}
                    className="select-none"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hero Text */}
      <div className="max-w-7xl mx-auto text-center relative z-20">
        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Power Your Creativity
        </motion.h1>
        <motion.p 
          className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Unlock unlimited possibilities with AI-generated hyper-realistic images, powerful prompts, and professional-grade creations. Subscribe today and start building your vision.
        </motion.p>
      </div>
    </section>
    </>
  )
}
