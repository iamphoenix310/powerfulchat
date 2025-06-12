// components/Payments/RazorpayCheckout.tsx
'use client'

import { useEffect } from 'react'

interface RazorpayCheckoutProps {
  imageId: string
  userEmail: string
  price: number
  onSuccess: () => void
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  imageId,
  userEmail,
  price,
  onSuccess,
}) => {
  const loadScript = () =>
    new Promise((resolve) => {
      if (document.querySelector('#razorpay-sdk')) return resolve(true)
      const script = document.createElement('script')
      script.id = 'razorpay-sdk'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const startPayment = async () => {
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, userEmail, price }),
      })

      const data = await res.json()

      if (!data.order?.id) {
        console.error('❌ Razorpay order creation failed:', data)
        alert('Could not create payment session. Try again later.')
        return
      }

      const { id: order_id, currency } = data.order

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: price * 100,
        currency,
        name: 'Powerful',
        description: 'Premium Image Purchase',
        order_id,
        prefill: {
          email: userEmail,
        },
        notes: {
          imageId,
          userEmail,
        },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageId,
              userEmail,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              price,
            }),
          })

          const result = await verifyRes.json()

          if (result.success) {
            onSuccess()
          } else {
            console.warn('❌ Payment verification failed:', result)
            alert('Payment succeeded but verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            console.warn('💡 Razorpay modal dismissed by user.')
          },
        },
        theme: {
          color: '#6366f1',
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      console.error('💥 Razorpay frontend error:', err)
      alert('Something went wrong while starting the payment.')
    }
  }

  useEffect(() => {
    loadScript().then((loaded) => {
      if (!loaded) {
        alert('Failed to load Razorpay SDK. Please check your connection.')
      } else {
        startPayment()
      }
    })
  }, [])

  return null
}

export default RazorpayCheckout
