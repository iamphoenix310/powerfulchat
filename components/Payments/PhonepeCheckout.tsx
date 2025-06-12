// /components/Payments/PhonePeCheckout.tsx
'use client'

import { useEffect } from 'react'

interface Props {
  imageId: string
  userEmail: string
  price: number
}

const PhonePeCheckout: React.FC<Props> = ({ imageId, userEmail, price }) => {
  useEffect(() => {
    const startPayment = async () => {
      try {
        const res = await fetch('/api/phonepe/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, userEmail, price }),
        })

        const data = await res.json()

        if (!data.redirectUrl) {
          alert('PhonePe order failed. Please try again.')
          return
        }

        window.location.href = data.redirectUrl
      } catch (err) {
        console.error('💥 PhonePe error:', err)
        alert('Something went wrong with PhonePe checkout.')
      }
    }

    startPayment()
  }, [imageId, userEmail, price])

  return null
}

export default PhonePeCheckout
