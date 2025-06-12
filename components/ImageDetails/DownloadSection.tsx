"use client"

import RazorpayCheckout from "@/components/Payments/RazorpayCheckout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowDownIcon, LockIcon } from 'lucide-react'
import Link from "next/link"
import React, { useState } from "react"

interface DownloadProps {
  isPaid: boolean
  isUnlocked: boolean
  price: number
  session: any
  creatorUsername?: string
  onDownload: () => void
  showLogin?: () => void
  isSubscriptionFree?: boolean
}

const DownloadSection: React.FC<DownloadProps> = ({
  isPaid,
  isUnlocked,
  price,
  session,
  onDownload,
  showLogin,
  creatorUsername,
  isSubscriptionFree,
}) => {
  const [showRazorpay, setShowRazorpay] = useState(false)

  const handleDownloadClick = () => {
    if (!session) {
      showLogin?.()
      return
    }
    if (isPaid && !isUnlocked && !isSubscriptionFree) return
    onDownload()
  }

  const handlePayClick = () => {
    if (!session) {
      showLogin?.()
      return
    }
    setShowRazorpay(true)
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Content Status Badge */}
      {isPaid ? (
        isUnlocked || isSubscriptionFree ? (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800">
                  Premium
                </Badge>
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                  Unlocked {isSubscriptionFree ? "via Subscription" : "via Purchase"}
                </span>
              </div>
              <span className="font-bold text-green-700 dark:text-green-400">₹{price.toFixed(2)}</span>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800">
                  <LockIcon className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
                <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">Locked Content</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">₹{price.toFixed(2)}</span>
            </CardContent>
          </Card>
        )
      ) : (
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800 px-3 py-1.5 text-sm">
          Free Download
        </Badge>
      )}

      {/* Payment Options */}
      {isPaid && !isUnlocked && !isSubscriptionFree && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-6"
        >
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                {/* Razorpay */}
                <div className="flex flex-col items-center w-full md:w-auto">
                  <Button
                    onClick={handlePayClick}
                    className="w-full md:w-auto bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-700 hover:to-amber-600"
                  >
                    <LockIcon className="h-4 w-4 mr-2" /> Pay and Unlock
                  </Button>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-2 text-center">
                    Pay once and get instant access.
                  </p>
                </div>

                {/* Subscribe */}
                {(creatorUsername === "pankaj" || creatorUsername === "powerful") && (
                  <div className="flex flex-col items-center w-full md:w-auto">
                    <Button variant="default" asChild className="w-full md:w-auto">
                      <Link href="/subscription">💎 Subscribe to Access</Link>
                    </Button>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-2 text-center">
                      Subscribers with 50+ credits get this for free.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Subscription Message */}
      {isPaid && isSubscriptionFree && (
        <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium rounded-lg text-xs border border-green-300 dark:border-green-800">
          🎉 Because You Subscribed, You are Eligible for Free Download!
        </div>
      )}

      {/* Download Button */}
      <Button
        onClick={handleDownloadClick}
        size="lg"
        className={`w-full h-12 ${
          isPaid && !isUnlocked && !isSubscriptionFree
            ? "bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-700 hover:to-amber-600"
            : ""
        }`}
      >
        <ArrowDownIcon className="mr-2 h-5 w-5" />
        {isPaid && !isUnlocked && !isSubscriptionFree ? "Unlock & Download" : "Download"}
      </Button>

      {/* Razorpay Checkout */}
      {showRazorpay && session?.user?.email && (
        <RazorpayCheckout
          imageId={session?.imageId}
          userEmail={session.user.email}
          price={price}
          onSuccess={() => {
            setShowRazorpay(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default DownloadSection
