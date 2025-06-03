'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export const useCurrentUserName = () => {
  const { data: session } = useSession()
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.username) {
      setName(session.user.username)
    } else if (session?.user?.name) {
      setName(session.user.name)
    } else {
      setName('?')
    }
  }, [session])

  return name || '?'
}
