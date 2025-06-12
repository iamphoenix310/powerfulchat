'use client'

import { urlFor } from "@/app/utils/sanityClient"
import ProductDownloadSection from "@/components/Products/Display/DownloadSection"
import PortableTextRenderer from "@/components/Shared/PortableTextRenderer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Crown, Tag, User } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "react-toastify"

interface FileMeta {
  url: string
  name: string
  size?: number
  type?: string
  uploadedAt?: string
}

interface Creator {
  _id: string
  username: string
  email?: string
  image?: any
}

interface ProductType {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  price?: number
  isPremium?: boolean
  mainimage?: any
  productImages?: any[]
  attachedFiles?: FileMeta[]
  unlockAfterPurchase?: boolean
  tags?: string[]
  body?: any
  creator?: Creator
  freeWithSubscription?: boolean
}

interface ProductDetailProps {
  product: ProductType
  session: any
  isUnlocked: boolean
  showLogin: () => void
  isSubscriptionFree?: boolean
}

export default function ProductDetail({
  product,
  session,
  isUnlocked,
  showLogin,
  isSubscriptionFree,
}: ProductDetailProps) {
  const allImages = [
    ...(product.mainimage ? [product.mainimage] : []),
    ...(product.productImages || [])
  ]
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)

  const downloadProduct = async () => {
    if (!session) return setShowLoginModal(true)

    const file = product?.attachedFiles?.[0]
    const isPremium = product?.isPremium

    if (!file?.url) {
      toast.error('Download failed. File not found.')
      return
    }

    if (!isPremium) {
      const response = await fetch(file.url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = blobUrl
      a.download = file.name || 'download'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)

      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id }),
      })

      return
    }

    const unlockedBySubscription = isSubscriptionFree || product.freeWithSubscription

    if (!isUnlocked && !unlockedBySubscription) {
      toast.error('Please unlock this product before downloading.')
      return
    }

    try {
      const key = file.url.split('/').slice(4).join('/')
      const res = await fetch('/api/r2-product-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })

      const { signedUrl } = await res.json()
      if (!signedUrl) {
        toast.error('Failed to generate download link.')
        return
      }

      const xhr = new XMLHttpRequest()
      xhr.responseType = 'blob'
      xhr.open('GET', signedUrl, true)

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setDownloadProgress(percent)
        }
      }

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const blob = xhr.response
          const blobUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = file.name || 'download'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)

          await fetch('/api/track-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product._id }),
          })

          setDownloadProgress(null)
        } else {
          toast.error('Download failed.')
          setDownloadProgress(null)
        }
      }

      xhr.onerror = () => {
        toast.error('Download failed.')
        setDownloadProgress(null)
      }

      xhr.send()
    } catch (err) {
      toast.error('Could not download file.')
      console.error('Download error:', err)
    }
  }

  return (
    <>
      {/* Download Progress Modal */}
      {downloadProgress !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <Card className="w-full max-w-md mx-auto shadow-2xl">
            <CardContent className="p-6 text-center relative">
              <button
                onClick={() => setDownloadProgress(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
                aria-label="Close"
              >
                ×
              </button>
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Downloading...</h3>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{downloadProgress}% completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <Card className="overflow-hidden shadow-lg">
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                  {allImages[selectedIdx] ? (
                    <Image
                      src={urlFor(allImages[selectedIdx], { width: 800, height: 800, highQuality: true  || "/placeholder.svg"})}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Tag className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                        </div>
                        <p>No Image Available</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      className={`flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedIdx === idx 
                          ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800 shadow-lg" 
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => setSelectedIdx(idx)}
                      type="button"
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <Image
                        src={img ? urlFor(img, { width: 200, height: 200 }) : "/placeholder.svg"}
                        alt={`${product.title} preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
                    {product.title}
                  </h1>
                  {product.isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg flex-shrink-0">
                      <Crown className="h-4 w-4 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {product.price ? `₹${product.price}` : "Free"}
                  </div>
                  {product.creator?.username && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span>by {product.creator.username}</span>
                    </div>
                  )}
                </div>

                {product.description && (
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Download Section */}
              <ProductDownloadSection
                isPaid={!!product.isPremium}
                isUnlocked={isUnlocked}
                price={product.price || 0}
                session={session}
                creatorUsername={product.creator?.username}
                onDownload={downloadProduct}
                showLogin={() => setShowLoginModal(true)}
                isSubscriptionFree={isSubscriptionFree}
                productId={product._id}
                freeWithSubscription={product.freeWithSubscription}
                attachedFiles={product.attachedFiles}
              />
            </div>
          </div>

          {/* Product Description */}
          {product.body && (
            <Card className="mt-12 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Product Details</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <PortableTextRenderer value={product.body} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
