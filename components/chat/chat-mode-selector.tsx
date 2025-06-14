'use client'

import { chatModes } from '@/lib/config/personas/chatmode'
import { ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function ChatModeSelector({
  onChange,
  initial = 'default'
}: {
  onChange: (id: string) => void
  initial?: string
}) {
  const [selectedId, setSelectedId] = useState(initial)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const selected = chatModes.find(m => m.id === selectedId)!

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-black-900 border border-black-700 rounded-lg hover:bg-gray-800"
        onClick={() => setOpen(prev => !prev)}
      >
        {selected.icon && <span>{selected.icon}</span>}
        <span>{selected.name}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-56 bg-black-800 rounded shadow-lg border border-black-700">
          {chatModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => {
                setSelectedId(mode.id)
                onChange(mode.id)
                setOpen(false)
                router.push(`/chat/new?mode=${mode.id}`) // ✅ Better than window.location.href
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700"
            >
              {mode.icon && <span className="mr-2">{mode.icon}</span>}
              {mode.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
