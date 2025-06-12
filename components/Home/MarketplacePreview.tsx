"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Button } from "@/components/ui/button"
import { FileIcon } from "lucide-react"

interface MarketplaceItem {
  _id: string
  title: string
  slug: { current: string }
  image?: any
  attachedFiles?: {
    url?: string
    type: string
    name: string
  }[]
  price?: number
  isPremium?: boolean
}

export default function MarketplacePreview() {
  const [items, setItems] = useState<MarketplaceItem[]>([])

  useEffect(() => {
    const fetchItems = async () => {
      const query = `*[_type == "images" && isPremium == true] | order(_createdAt desc)[0...4] {
        _id,
        title,
        slug,
        image,
        attachedFiles,
        price,
        isPremium
      }`
      const result = await client.fetch(query)
      setItems(result)
    }

    fetchItems()
  }, [])

  return (
    <section className="w-full bg-white text-black py-20">
      <div className="px-4 max-w-6xl mx-auto space-y-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Upload & Sell Your Content</h2>
        <p className="text-black/70 max-w-xl mx-auto text-base">
          Upload high-quality images, PDF guides, or ZIP bundles. Set your price and earn directly from your content.
        </p>

        {/* Grid of Items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link
              key={item._id}
              href={`/images/${item.slug.current}`}
              className="group bg-black/5 hover:bg-black/10 transition rounded-xl p-4 flex flex-col items-center text-center"
            >
              {/* Thumbnail */}
              <div className="w-full aspect-[4/5] relative rounded-md overflow-hidden shadow-sm bg-white">
                {item.image ? (
                  <Image
                    src={urlFor(item.image, {
                      width: 600,
                      height: 750,
                      highQuality: true,
                    })}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : item.attachedFiles && item.attachedFiles.length > 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-black/50">
                    <FileIcon className="w-12 h-12" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/30 text-xs">
                    No preview
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 space-y-1">
                <h3 className="text-sm font-semibold line-clamp-2">{item.title}</h3>
                <p className="text-xs text-black/60">
                  {item.isPremium ? `₹${item.price}` : "Free"}
                </p>
                <Button size="sm" className="mt-2 px-4">
                  {item.isPremium ? "Buy Now" : "View"}
                </Button>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA to Upload */}
        <div className="mt-10">
          <Link href="/upload">
            <Button size="lg" className="px-6 py-3 text-base font-medium">
              Upload Your Content
            </Button>
          </Link>
          <p className="text-black/60 text-sm italic mt-2">
          * requires registration, Uploading is free!
        </p>
        </div>
      </div>
    </section>
  )
}
