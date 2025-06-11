'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  profileImage?: string | null
}

export const useCurrentUserImage = () => {
  const { data: session } = useSession() as { data: { user: SessionUser } | null }
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.profileImage) {
      setImage(session.user.profileImage)
    } else if (session?.user?.image) {
      // Fallback to default next-auth image
      setImage(session.user.image)
    } else {
      setImage(null)
    }
  }, [session])

  return image
}
