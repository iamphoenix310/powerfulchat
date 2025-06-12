'use client'

import { client, urlFor } from '@/app/utils/sanityClient'
import { Badge } from '@/components/ui/badge'
import { Crown, ShoppingCart, Sparkles, Star, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ProductTeaser() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.fetch(`*[_type == "products"] | order(_createdAt desc)[0...4]{
      _id, title, slug, mainimage, price, isPremium
    }`).then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl aspect-square mb-3"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product, index) => (
        <Link key={product._id} href={`/products/${product.slug.current}`}>
          <div className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-700 hover:scale-[1.02]">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.mainimage ? urlFor(product.mainimage, { width: 400, height: 400 }) : "/placeholder.svg?height=400&width=400"}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Hover action */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-3 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                  <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              
              {/* Featured badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                    <Sparkles className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}
              
              {/* Premium badge */}
              {product.isPremium && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 leading-tight">
                {product.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                  <Tag className="h-3 w-3" />
                  <span className="text-sm font-semibold">
                    {product.price ? `₹${product.price}` : 'Free'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center pt-1 border-t border-gray-100 dark:border-gray-800">
                Click to view details →
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
