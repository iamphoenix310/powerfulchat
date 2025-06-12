"use client"

import { CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function SuccessAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <CheckCircle className="h-10 w-10 text-green-600" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-xl font-semibold text-center"
      >
        Account Created Successfully!
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-500 text-center mt-2"
      >
        Redirecting you to complete your profile...
      </motion.p>
    </div>
  )
}
