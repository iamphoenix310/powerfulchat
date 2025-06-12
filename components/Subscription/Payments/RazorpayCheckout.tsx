'use client'

import React from 'react'
import { useSession } from 'next-auth/react'

interface RazorpayCheckoutProps {
  planName: string
  amount: number // In ₹
  credits: number
}

function loadScript(src: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = () => reject(false)
    document.body.appendChild(script)
  })
}

export default function RazorpayCheckout({ planName, amount, credits }: RazorpayCheckoutProps) {
  const { data: session } = useSession()

  const loadRazorpay = async () => {
    if (typeof window === 'undefined') return

    const razorpayLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

    if (!razorpayLoaded) {
      alert('Failed to load Razorpay SDK. Please try again later.')
      return
    }

    const res = await fetch('/api/razorpay/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName, amount, credits }),
    })
    const data = await res.json()

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.amount,
      currency: 'INR',
      name: 'Powerful Creations',
      description: `Purchase ${planName}`,
      image: '/logo.png',
      order_id: data.id,
      handler: async function (response: any) {
        const verifyRes = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userEmail: session?.user?.email, 
            planName,
            amount,
            credits,
            subscriptionPurchase: true,
          }),
        })

        if (verifyRes.ok) {
          window.location.href = '/payment-success'
        } else {
          alert('Payment Verification Failed. Please contact support.')
        }
      },
      prefill: {
        name: session?.user?.name || '',
        email: session?.user?.email || '',
      },
      theme: {
        color: '#2563eb',
      },
    }

    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()
  }

  return (
    <button
      onClick={loadRazorpay}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
    >
      Subscribe Now
    </button>
  )
}
