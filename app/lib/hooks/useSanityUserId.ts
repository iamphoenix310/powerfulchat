'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function useSanityUserId() {
  const { data: session } = useSession()
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/getUserId?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.userId) setUserId(data.userId)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [session])

  return { userId, loading }
}
