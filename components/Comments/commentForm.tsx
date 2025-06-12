'use client'

import { useState, useRef } from 'react'
import { submitCommentClient } from '@/app/actions/submitComment'
import { toast } from 'sonner'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

interface CommentFormProps {
  imageId: string
  parentId?: string
  onSuccess?: (optimisticComment: any) => void
  mutate?: () => void
  textareaRef?: (ref: HTMLTextAreaElement | null) => void
}

export default function CommentForm({
  imageId,
  parentId,
  onSuccess,
  mutate,
  textareaRef,
}: CommentFormProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const internalRef = useRef<HTMLTextAreaElement | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (trimmed.length < 2) {
      toast.error('Too short!')
      return
    }
  
    setText('')
  
    try {
      setLoading(true)
      const newComment = await submitCommentClient({ imageId, text: trimmed, parentId })

  
      // Broadcast to all tabs
      const bc = new BroadcastChannel('comments-sync')
      bc.postMessage({ imageId })
      bc.close()
  
      // Directly update via onSuccess
      onSuccess?.(newComment)
  
      // Optional: trigger full revalidation
      mutate?.()
    } catch (err) {
      console.error('Submit failed:', err)
      toast.error('Failed to post comment')
    } finally {
      setLoading(false)
    }
  }
  

  const handleEmojiSelect = (emoji: any) => {
    const el = internalRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const updated = text.slice(0, start) + emoji.native + text.slice(end)

    setText(updated)

    setTimeout(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + emoji.native.length
    }, 0)
  }

  return (
    <div className="w-full relative mt-2">
      {/* Emoji button only on desktop */}
      <div className="hidden md:flex justify-between items-center mb-1">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-xl"
          aria-label="Toggle emoji picker"
        >
          😊
        </button>
      </div>

      <textarea
        ref={(el) => {
          internalRef.current = el
          textareaRef?.(el)
        }}
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          const isMac = navigator.platform.toLowerCase().includes('mac')
          if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
          }
        }}
        placeholder={parentId ? 'Write a reply…' : 'Write your comment…'}
        className="w-full resize-none text-base px-4 py-3 pr-10 rounded-md border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />

      {/* Emoji picker panel only on desktop */}
      {showEmojiPicker && (
        <div className="hidden md:block absolute z-50 top-full left-0 mt-2">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        aria-label="Post comment"
        className="absolute bottom-2 right-2 text-indigo-500 hover:text-indigo-400 disabled:opacity-50 transition"
      >
        {loading ? (
          <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
        ) : (
          <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
        )}
      </button>
    </div>
  )
}
