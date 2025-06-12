"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Send, Loader2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import { ModelSelector } from "./ModelSelector"
import { ConversationHistory } from "./ConversationHistory"
import { MessageBubble } from "./MessageBubble"
import type { ChatConversation } from "@/types/chat"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"


export function ChatInterface() {
  const { data: session } = useSession()
  const isMobile = useIsMobile()
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [hasStartedConversation, setHasStartedConversation] = useState(false)


 const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
  api: "/api/chat",
  body: {
    model: selectedModel,
    conversationId: currentConversation?._id,
    title: currentConversation?.title,
  },
  onFinish: () => {
    setTimeout(() => {
      scrollAreaRef.current?.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }, 100)
  },
  onResponse(response: any) {
    if (
      !currentConversation?._id &&
      response &&
      response.extras &&
      response.extras.conversationId
    ) {
      setCurrentConversation((prev) => {
        if (!prev) return null
        return {
          ...prev,
          _type: "conversation",
          _id: response.extras.conversationId,
        }
      })
    }
  }
})


  useEffect(() => {
    scrollAreaRef.current?.scrollTo({
      top: scrollAreaRef.current.scrollHeight,
      behavior: "auto",
    })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleConversationSelect = (conversation: ChatConversation | null) => {
    setCurrentConversation(conversation)
    if (conversation) {
      setMessages(
        conversation.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        })),
      )
      setSelectedModel(conversation.model)
    } else {
      setMessages([])
    }
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleNewChat = () => {
    setCurrentConversation(null)
    setMessages([])
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if (!input.trim() || isLoading) return

    if (!currentConversation && !hasStartedConversation) {
    const title = input.slice(0, 50) + (input.length > 50 ? "..." : "")
    const newConv: ChatConversation = {
      _type: "conversation",
      title,
      messages: [],
      userId: (session?.user as any)?.id || "",
      model: selectedModel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCurrentConversation(newConv)
    setHasStartedConversation(true)
    setTimeout(() => handleSubmit(e), 0)
    return
  }

  handleSubmit(e)
}


  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Chat History</h2>
      </div>
      <ConversationHistory
        selectedConversationId={currentConversation?._id}
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
      />
    </div>
  )

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in to use the chat</h2>
          <p className="text-gray-600">You need to be authenticated to access the AI chat.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 flex overflow-hidden">
        {!isMobile && (
          <div className="w-80 border-r bg-gray-50">
            <SidebarContent />
          </div>
        )}

        <div className="flex-1 flex flex-col relative">
          <div className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                      <SidebarContent />
                    </SheetContent>
                  </Sheet>
                )}
                <div>
                  <h1 className="font-semibold text-lg">{currentConversation?.title || "New Chat"}</h1>
                  <p className="text-sm text-gray-600">AI-powered assistant ready to help</p>
                </div>
              </div>
              <div className="w-64">
                <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} disabled={isLoading} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-36" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto pt-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                    <p className="text-gray-600 mb-6">
                      Ask me anything! I can help with questions, writing, analysis, coding, and more.
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="p-3 bg-gray-50 rounded-lg text-left">
                        💡 &quot;Explain quantum computing in simple terms&quot;
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-left">📝 &quot;Help me write a professional email&quot;</div>
                      <div className="p-3 bg-gray-50 rounded-lg text-left">🔍 &quot;Analyze this data and find patterns&quot;</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={{
                        id: message.id,
                        role: message.role as "user" | "assistant",
                        content: message.content,
                        timestamp: new Date(),
                        model: message.role === "assistant" ? selectedModel : undefined,
                      }}
                      userImage={session.user?.image}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 left-0 right-0 border-t bg-white p-4 z-10">
            <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="min-h-[44px] max-h-[120px] resize-none pr-12 py-3"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        onSubmit(e as any)
                      }
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-11 px-4 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
