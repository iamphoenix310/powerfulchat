'use client'

import { Clock } from 'lucide-react'

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 text-gray-600 space-y-4">
      <Clock className="w-10 h-10 text-gray-500" />
      <h2 className="text-2xl font-bold">Coming Soon</h2>
      <p className="text-sm max-w-md">
        This feature is currently under development. Stay tuned — we’re building something amazing for you!
      </p>
    </div>
  )
}
