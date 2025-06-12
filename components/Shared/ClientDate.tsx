'use client'

import { useEffect, useState } from 'react'


interface ClientDateProps {
  iso: string
  showTime?: boolean
}

export default function ClientDate({ iso, showTime = true }: ClientDateProps) {
  const [formatted, setFormatted] = useState('')

  useEffect(() => {
    const date = new Date(iso)
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    if (showTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }
    setFormatted(date.toLocaleString('en-GB', options))
  }, [iso, showTime])

  return <time dateTime={iso}>{formatted}</time>
}
