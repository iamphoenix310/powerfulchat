'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

export default function RegenerateBioButton({ celebId, celebName }: { celebId: string, celebName: string }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    toast.info(`Regenerating bio for ${celebName}...`)

    const res = await fetch('/api/regenerateBio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: celebId, name: celebName }),
    })

    if (res.ok) {
      toast.success(`✅ Biography regenerated for ${celebName}`)
    } else {
      toast.error(`❌ Failed to regenerate bio for ${celebName}`)
    }

    setLoading(false)
  }

  return (
    <Button onClick={handleClick} disabled={loading} size="sm">
      {loading ? 'Regenerating…' : 'Regenerate Biography'}
    </Button>
  )
}
