'use client'

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import ProductDetail from "./ProductDetail"

interface ProductDetailClientProps {
  product: any
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { data: session } = useSession()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPurchase = async () => {
      if (session?.user?.email && product?._id) {
        try {
          const res = await fetch('/api/check-purchase-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: product._id,
              userEmail: session.user.email,
            }),
          })
          const data = await res.json()
          setIsUnlocked(data.hasPurchased)
        } catch (error) {
          console.error('Error checking purchase:', error)
        }
      }
      setLoading(false)
    }
    checkPurchase()
  }, [session, product])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProductDetail
      product={product}
      session={session}
      isUnlocked={isUnlocked}
      showLogin={() => setShowLogin(true)}
    />
  )
}
