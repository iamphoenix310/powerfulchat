'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <CheckCircle className="text-green-500 w-20 h-20 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Payment Successful! 🎉</h1>
        <p className="text-gray-400 text-lg mb-8">
          Your subscription is now active. You can start generating images!
        </p>

        <Link href="/dashboard">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl">
            Go to Dashboard
          </button>
        </Link>
      </motion.div>
    </div>
  )
}
