"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { ChatConversation } from "@/types/chat"

interface ConversationHistoryProps {
  selectedConversationId?: string
  onConversationSelect: (conversation: ChatConversation | null) => void
  onNewChat: () => void
}

export function ConversationHistory({
  selectedConversationId,
  onConversationSelect,
  onNewChat,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (hasLoaded) return
    fetchConversations()
  }, [hasLoaded])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        setHasLoaded(true)
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch("/api/chat/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      })

      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c._id !== conversationId))
        if (selectedConversationId === conversationId) {
          onConversationSelect(null)
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={onNewChat} className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversationId === conversation._id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
                onClick={() => onConversationSelect(conversation)}
              >
                <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{conversation.title}</div>
                  <div className="text-xs text-gray-500">{formatDate(conversation.updatedAt)}</div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this conversation? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteConversation(conversation._id!)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
