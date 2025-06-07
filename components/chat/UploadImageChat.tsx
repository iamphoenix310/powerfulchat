'use client'

import { useState } from 'react'

export default function UploadImageChat({ onSubmit }: { onSubmit: (imgUrl: string, prompt: string) => void }) {
  const [imageUrl, setImageUrl] = useState('')
  const [prompt, setPrompt] = useState('Describe this image')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl || !prompt) return
    onSubmit(imageUrl, prompt)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="url"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask something about the image"
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="btn btn-primary">
        Analyze Image
      </button>
    </form>
  )
}
