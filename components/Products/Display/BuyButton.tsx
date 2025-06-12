'use client'

import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from 'lucide-react'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface BuyButtonProps {
  productId: string
  productSlug: string
  productTitle: string
  amount: number
  onComplete?: () => void
}

export function BuyButton({ productId, productSlug, productTitle, amount, onComplete }: BuyButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    // 1. Create order from backend
    const res = await fetch("/api/razorpay/products/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        productId,
        productTitle,
      }),
    })
    const order = await res.json()
    if (!order.id) {
      alert("Could not create payment order.")
      setLoading(false)
      return
    }

    // 2. Setup Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency,
      name: "Powerful",
      description: productTitle,
      order_id: order.id,
      prefill: {
        email: session?.user?.email || "",
        name: session?.user?.name || "",
      },
      handler: async function (response: any) {
        // 3. Verify payment
        const verifyRes = await fetch("/api/razorpay/products/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            productId,
            email: session?.user?.email || "",
          }),
        })
        const verify = await verifyRes.json()
        setLoading(false)
        if (verify.success) {
          // Success! Redirect to download page or unlock
          router.push(`/products/download/${productSlug}`)
          onComplete?.()
        } else {
          alert("Payment could not be verified. Please contact support.")
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
      theme: { 
        color: "#6366f1",
        backdrop_color: "rgba(0, 0, 0, 0.6)"
      },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <Button
      size="lg"
      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600"
      onClick={handleBuy}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Buy & Download
        </>
      )}
    </Button>
  )
}
