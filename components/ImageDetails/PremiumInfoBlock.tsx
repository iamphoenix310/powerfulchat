'use client'

import React from 'react'

interface PremiumInfoBlockProps {
  isPremium: boolean
  downloadMode?: 'free' | 'paid' | 'pwyw'
  price?: number
  unlockAfterPurchase?: boolean
  isUnlocked?: boolean
  attachedFiles?: { url: string; name: string }[]
}

const PremiumInfoBlock: React.FC<PremiumInfoBlockProps> = ({
  isPremium,
  downloadMode = 'free',
  price = 0,
  unlockAfterPurchase = true,
  isUnlocked = false,
  attachedFiles = [],
}) => {
  if (!isPremium || downloadMode === 'free') {
    return (
      <div className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded shadow">
        ✅ This image is free to download.
      </div>
    )
  }

  return (
    <div className="mt-4 bg-yellow-100 text-yellow-800 px-4 py-3 rounded shadow space-y-2">
      <p className="font-semibold">
        🔒 Premium Download - {price ? price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'Price not set'}

      </p>

      {!isUnlocked && unlockAfterPurchase && (
        <p className="text-sm">You need to purchase to unlock the download.</p>
      )}

      {(isUnlocked || !unlockAfterPurchase) && attachedFiles.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium">📦 Included Files:</p>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {attachedFiles.map((file, i) => (
              <li key={i}>
                <a
                  href={file.url}
                  download
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default PremiumInfoBlock
