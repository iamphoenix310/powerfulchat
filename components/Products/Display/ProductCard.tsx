'use client'

import { urlFor } from "@/app/utils/sanityClient"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, Star } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"

export interface Product {
  _id: string
  title: string
  slug: { current: string }
  mainimage?: any
  price?: number
  isPremium?: boolean
  description?: string
  productImages?: any[]
}

export default function ProductCard({ product }: { product: Product }) {
  const mainImageUrl = product.mainimage ? urlFor(product.mainimage) : "/placeholder.svg?height=300&width=300"

  return (
    <Card className="group w-full max-w-xs mx-auto bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900 transition-all duration-300 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:scale-[1.02] overflow-hidden">
      <Link href={`/products/${product.slug.current}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={mainImageUrl || "/placeholder.svg"}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-all duration-500 group-hover:scale-110"
            priority={false}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Premium badge */}
          {product.isPremium && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </div>
          )}
          
          {/* Price badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 font-semibold shadow-lg backdrop-blur-sm">
              {product.price ? `₹${product.price}` : "Free"}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="text-base font-semibold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
              {product.title}
            </h3>
            
            {product.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
          
          {/* Rating stars */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
              ))}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(4.8)</span>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              View Details →
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
