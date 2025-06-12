'use client'

import RazorpayProductCheckout from '@/components/Payments/RazorpayProductCheckout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowDownIcon, Crown, LockIcon, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

interface AttachedFile {
  url: string
  name: string
  size?: number
  type?: string
  uploadedAt?: string
}

interface ProductDownloadProps {
  isPaid: boolean
  isUnlocked: boolean
  price: number
  session: any
  creatorUsername?: string
  onDownload: () => void
  showLogin?: () => void
  isSubscriptionFree?: boolean
  freeWithSubscription?: boolean
  productId: string
  attachedFiles?: AttachedFile[]
}

const ProductDownloadSection: React.FC<ProductDownloadProps> = ({
  isPaid,
  isUnlocked,
  price,
  session,
  onDownload,
  showLogin,
  isSubscriptionFree,
  freeWithSubscription,
  productId,
  attachedFiles = [],
}) => {
  const [showRazorpay, setShowRazorpay] = useState(false)

  const unlockedBySubscription = isSubscriptionFree || freeWithSubscription

  const handleDownloadClick = () => {
    if (!session) return showLogin?.()
    if (isPaid && !isUnlocked && !unlockedBySubscription) return
    onDownload()
  }

  const handlePayClick = () => {
    if (!session) return showLogin?.()
    setShowRazorpay(true)
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Access Status */}
      {isPaid ? (
        isUnlocked || unlockedBySubscription ? (
          <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800/50 shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                  <Crown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700">
                    Premium Unlocked
                  </Badge>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mt-1">
                    {unlockedBySubscription ? 'Access via Subscription' : 'Purchased Successfully'}
                  </p>
                </div>
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">₹{price.toFixed(2)}</span>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/50 shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                  <LockIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700">
                    Premium Content
                  </Badge>
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mt-1">Purchase Required</p>
                </div>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">₹{price.toFixed(2)}</span>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800/50 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
              <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 px-3 py-1.5 text-sm">
              Free Download Available
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Pay and Subscribe Options */}
      {isPaid && !isUnlocked && !unlockedBySubscription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mt-6"
        >
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800/50 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Unlock Premium Content</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred access method</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                {/* Razorpay Pay Button */}
                <div className="flex flex-col items-center w-full md:w-auto">
                  <Button
                    onClick={handlePayClick}
                    size="lg"
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600"
                  >
                    <LockIcon className="h-4 w-4 mr-2" /> 
                    Pay ₹{price} & Unlock
                  </Button>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 text-center">
                    One-time payment • Instant access
                  </p>
                </div>

                {/* Subscription Option */}
                {freeWithSubscription && (
                  <>
                    <div className="text-gray-400 dark:text-gray-500 font-medium">OR</div>
                    <div className="flex flex-col items-center w-full md:w-auto">
                      <Button variant="outline" size="lg" asChild className="w-full md:w-auto border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50">
                        <Link href="/subscription" className="flex items-center">
                          <Crown className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                          Subscribe for Free Access
                        </Link>
                      </Button>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 text-center">
                        Subscribers get unlimited access
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Subscription Badge */}
      {isPaid && unlockedBySubscription && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-950/50 dark:to-blue-950/50 text-emerald-800 dark:text-emerald-200 font-medium rounded-lg text-sm border border-emerald-300 dark:border-emerald-800/50 shadow-sm"
        >
          <Crown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          🎉 Subscription Benefit: This premium content is free for you!
        </motion.div>
      )}

      {/* Download Button */}
      <Button
        onClick={handleDownloadClick}
        size="lg"
        className={`w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
          isPaid && !isUnlocked && !unlockedBySubscription
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600'
        }`}
      >
        <ArrowDownIcon className="mr-2 h-5 w-5" />
        {isPaid && !isUnlocked && !unlockedBySubscription ? 'Unlock & Download' : 'Download Now'}
      </Button>

      {/* Razorpay Modal */}
      {showRazorpay && session?.user?.email && (
        <RazorpayProductCheckout
          productId={productId}
          userEmail={session.user.email}
          price={price}
          onSuccess={() => {
            toast.success('Purchase successful! 🎉')
            setShowRazorpay(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default ProductDownloadSection
