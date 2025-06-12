"use client"

import { useState } from "react"
import { Copy, Check, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ChatMessage } from "@/types/chat"
import ReactMarkdown from 'react-markdown'


interface MessageBubbleProps {
  message: ChatMessage
  userImage?: string | null
}

export function MessageBubble({ message, userImage }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-3 mb-6">
        <div className="flex flex-col items-end max-w-[80%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</span>
        </div>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={userImage || undefined} />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-6">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-gray-100 text-gray-600">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col max-w-[80%]">
        <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm group relative">
          <ReactMarkdown className="prose prose-sm max-w-none text-gray-800">
            {message.content}
          </ReactMarkdown>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
          >
            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-500" />}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
          {message.model && <span className="text-xs text-gray-400">• {message.model}</span>}
        </div>
      </div>
    </div>
  )
}
