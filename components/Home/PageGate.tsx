'use client'

import { useSession } from 'next-auth/react'

export default function PageGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-500" />
      </div>
    )
  }

  return <>{children}</>
}
