'use client'

import { useEffect, useState } from 'react'
import { client, urlFor } from '@/app/utils/sanityClient'
import Image from 'next/image'
import AuthFormHome from '@/components/Auth/AuthFormHome'
import { useSession } from 'next-auth/react'
import { Audiowide } from 'next/font/google'

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] })

interface HeroImage {
  _id: string
  image: any
}

export default function HeroSection() {
  const [images, setImages] = useState<HeroImage[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    const fetchImages = async () => {
      const query = `*[_type == "images"] | order(_createdAt desc)[0...3]{_id, image}`
      const results = await client.fetch(query)
      setImages(results)
    }

    fetchImages()
  }, [])

  return (
    !session && (
      <section className="relative w-full min-h-screen bg-black text-white overflow-hidden">
        {/* Background images */}
        <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-80">
          {images.map((img) => (
            <div key={img._id} className="relative h-full w-full">
              <Image
                src={urlFor(img.image)}
                alt="hero-bg"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Main content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 px-6 py-16 max-w-7xl mx-auto">
          {/* LEFT SIDE */}
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight ${audiowide.className}`}>
              Powerful
            </h1>
            <p className="text-lg md:text-xl font-medium text-white/90">
              Create the impossible
            </p>
            <p className="text-sm md:text-base text-white/70">
              A platform for creators and image lovers
            </p>

            {/* Embedded YouTube video */}
            {/* <div className="aspect-video w-full max-w-xl mx-auto md:mx-0 rounded-lg overflow-hidden shadow-xl border border-white/20">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/cKHb4MBX_bU"
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div> */}
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full md:w-1/2 max-w-md bg-white/10 p-6 rounded-xl backdrop-blur-sm shadow-lg">
            <AuthFormHome />
          </div>
        </div>
      </section>
    )
  )
}
