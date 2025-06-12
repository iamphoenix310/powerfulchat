'use client'
import { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')

  return (
    <div className="w-full flex items-center justify-center">
      <input
        type="text"
        placeholder="Search albums or songs..."
        className="w-full max-w-2xl px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )
}
