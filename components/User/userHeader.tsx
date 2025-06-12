'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { urlFor } from '@/app/utils/sanityClient'

interface UserHeaderProps {
  username: string
  email?: string // optional, will get from session if not passed
}

const UserHeader: React.FC<UserHeaderProps> = ({ username, email }) => {
  const { data: session } = useSession()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const initials = username ? username.charAt(0).toUpperCase() : 'U'

  useEffect(() => {
    const fetchUser = async () => {
      const userEmail = email || session?.user?.email
      if (!userEmail) return

      const res = await fetch('/api/user/user-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      })

      const data = await res.json()
      if (data?.profileImage?.asset?._ref) {
        setImageUrl(urlFor(data.profileImage))
      } else if (session?.user?.image) {
        setImageUrl(session.user.image)
      }
    }

    fetchUser()
  }, [email, session])

  return (
    <div className="flex items-center gap-4 border-b pb-4 mb-6">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={username}
          width={60}
          height={60}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-300 text-gray-800 font-semibold rounded-full flex items-center justify-center text-xl">
          {initials}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">{username}</h1>
      </div>
    </div>
  )
}

export default UserHeader
