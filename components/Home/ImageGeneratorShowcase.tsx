"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Button } from "@/components/ui/button"

interface GeneratedImage {
  _id: string
  image: any
  prompt: string
}

export default function ImageGeneratorShowcase() {
  const [images, setImages] = useState<GeneratedImage[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      const query = `*[_type == "imageGeneration" && status == "published"] | order(_createdAt desc)[0...4] {
        _id,
        image,
        prompt
      }`
      const result = await client.fetch(query)

      // Shuffle the images randomly
      const shuffled = [...result].sort(() => 0.5 - Math.random())
      setImages(shuffled)
    }

    fetchImages()
  }, [])

  return (
    <section className="w-full bg-black text-white py-20">
      <div className="px-4 max-w-6xl mx-auto text-center space-y-10">
        <h2 className="text-3xl md:text-4xl font-bold">
          Create Any Image You Can Imagine
        </h2>
        <p className="text-white/80 max-w-xl mx-auto text-base">
          Powered by advanced AI and using simple prompts.
        </p>
        

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {images.map((img) => (
            <div
              key={img._id}
              className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md border border-white/10 bg-white/5"
            >
              <Image
                src={urlFor(img.image, {
                  width: 600,
                  height: 900,
                  highQuality: true,
                })}
                alt={img.prompt}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link href="/generate">
            <Button size="lg" className="px-6 py-3 text-base font-medium">
              Generate Now
            </Button>
          </Link>
          <p className="text-white/60 text-sm italic mt-2">
          * Get Your Free Trial of 5 Image Generations Today!
        </p>
        </div>
       
      </div>
    </section>
  )
}
