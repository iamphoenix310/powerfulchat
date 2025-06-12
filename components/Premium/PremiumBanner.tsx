"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export default function PremiumBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-lg shadow-md mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg">Unlock Premium Content</h3>
              <p className="text-emerald-100 mt-1">
                Get access to exclusive high-quality content with our premium subscription
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="bg-white text-emerald-700 px-4 py-2 rounded-md font-medium hover:bg-emerald-50 transition-colors"
              >
                View Plans
              </Link>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white hover:text-emerald-200"
                aria-label="Close banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
