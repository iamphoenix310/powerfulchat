"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { client, urlFor } from "@/app/utils/sanityClient"
import { motion } from "framer-motion"
import Image from "next/image"

interface ImageType {
  _id: string
  title: string
  image: any
  slug: {
    current: string
  }
}

const SubscriptionSection = () => {
  const { data: session, status } = useSession()
  const [subscriptionActive, setSubscriptionActive] = useState(false)
  const [images, setImages] = useState<ImageType[]>([])

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const user = await client.fetch(
            `*[_type == "user" && email == $email][0]{ subscriptionActive }`,
            { email: session.user.email }
          )
          setSubscriptionActive(user?.subscriptionActive || false)
        } catch (error) {
          console.error("Error fetching subscription status:", error)
        }
      }
    }

    const fetchImages = async () => {
      try {
        const result = await client.fetch(
          `*[_type == "images"] | order(_createdAt desc)[0...5]{
            _id, title, image, slug
          }`
        )
        setImages(result)
      } catch (error) {
        console.error("Error fetching images:", error)
      }
    }

    fetchSubscriptionStatus()
    fetchImages()
  }, [session, status])

  if (subscriptionActive) return null

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768
  const visibleImages = isMobile ? images.slice(0, 2) : images.slice(0, 5)

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col justify-center items-center py-10">
      {/* Floating Images */}
      <div className="w-full flex justify-center gap-4 md:gap-6 mb-12 px-4 pt-12 pb-12 overflow-x-hidden">
        <div className="flex space-x-4 md:space-x-6">
          {visibleImages.map((img, idx) => (
            <motion.div
              key={img._id}
              className="relative w-36 h-56 md:w-48 md:h-72 lg:w-64 lg:h-96 rounded-md overflow-hidden shadow-lg"
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 4 + idx * 0.3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              <Link href={`/images/${img.slug.current}`} className="block w-full h-full">
                <Image
                  src={urlFor(img.image)}
                  alt={img.title}
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) 100px, (max-width: 1200px) 150px, 200px"
                  priority
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="absolute bottom-2 right-2 z-10 opacity-60">
                  <Image
                    src="/logo-watermark.png"
                    alt="Watermark"
                    width={40}
                    height={40}
                    className="pointer-events-none select-none"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6 px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-snug">
          What Are You Waiting For?
        </h2>

        <div className="flex justify-center gap-4 flex-wrap mt-6">
          {status !== "authenticated" && (
            <Link href="/auth?mode=signup">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition shadow-lg">
                ✨ Sign Up Free
              </button>
            </Link>
          )}
          <Link href="/subscription">
            <button className="bg-white text-blue-700 font-bold py-3 px-6 rounded-2xl hover:bg-gray-100 transition shadow-lg">
              🚀 View Subscription Plans
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionSection
