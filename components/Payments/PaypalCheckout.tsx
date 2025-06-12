'use client'

import { useEffect, useRef, useState } from 'react'

interface PayPalCheckoutProps {
  imageId: string
  userEmail: string
  price: number
  onSuccess: () => void
}

declare global {
  interface Window {
    paypal?: any
  }
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  imageId,
  userEmail,
  price,
  onSuccess,
}) => {
  const paypalRef = useRef<HTMLDivElement>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  // ✅ Dynamically inject PayPal SDK script once
  useEffect(() => {
    if (window.paypal) {
      setIsScriptLoaded(true)
      return
    }

    const existingScript = document.querySelector(
      'script[src*="paypal.com/sdk/js"]'
    ) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true))
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
    script.async = true
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => {
      console.error('❌ Failed to load PayPal SDK')
    }

    document.body.appendChild(script)

    return () => {
      // ❌ Optional cleanup if needed
      script.remove()
    }
  }, [])

  // ✅ Safely render PayPal buttons
  useEffect(() => {
    if (!isScriptLoaded || !paypalRef.current || !window.paypal) return

    // 💥 Prevent re-render duplicates
    if (paypalRef.current.hasChildNodes()) return

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold' },
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              description: `Image ${imageId}`,
              amount: { value: price.toFixed(2) },
            },
          ],
        })
      },
      onApprove: async (data: any, actions: any) => {
        const details = await actions.order.capture()
        const paymentId = details.id

        const res = await fetch('/api/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, userEmail, paymentId, price }),
        })

        const result = await res.json()
        if (result.success) {
          onSuccess()
        } else {
          alert('⚠️ Payment captured but saving failed.')
        }
      },
      onError: (err: any) => {
        console.error('💥 PayPal error:', err)
        alert('Payment failed, please try again.')
      },
    }).render(paypalRef.current)
  }, [isScriptLoaded, imageId, userEmail, price, onSuccess])

  return <div ref={paypalRef} className="mt-4" />
}

export default PayPalCheckout
