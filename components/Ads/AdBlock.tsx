'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface AdBlockProps {
  adSlot: string
  className?: string
}

export default function AdBlock({ adSlot, className }: AdBlockProps) {
  const { data: session } = useSession()
  const adRef = useRef<HTMLDivElement>(null)

  const isDev = process.env.NODE_ENV !== 'production'
  const adClient = isDev ? 'ca-pub-0000000000000000' : 'ca-pub-4196999734826664'
  const slot = isDev ? '0000000000' : adSlot

  const subscriptionActive = !!(session?.user as any)?.subscriptionActive

  useEffect(() => {
    if (session?.user) {
    }
  }, [session, subscriptionActive])

  useEffect(() => {
    if (!subscriptionActive && typeof window !== 'undefined') {
      try {
        const adContainer = adRef.current?.querySelector('ins.adsbygoogle')
        if (adContainer && !(adContainer as any).dataset.loaded) {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
          ;(adContainer as any).dataset.loaded = 'true'
        }
      } catch (err) {
        console.warn('AdSense push error:', err)
      }
    }
  }, [subscriptionActive])

  if (subscriptionActive) return null

  return (
    <div className={className} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(isDev && { 'data-adtest': 'on' })}
      ></ins>

      {isDev && (
        <div className="text-center text-xs text-gray-500 mt-1">
          [Test Ad Placeholder]
        </div>
      )}
    </div>
  )
}
