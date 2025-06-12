'use client'
import Script from 'next/script'

const adClient = process.env.NODE_ENV !== 'production'
  ? 'ca-pub-0000000000000000'
  : 'ca-pub-4196999734826664'

export default function GlobalHead() {
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      data-ad-client={adClient}
      crossOrigin="anonymous"
    />
  )
}
