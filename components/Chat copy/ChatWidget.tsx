"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Send, MessageCircle, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"

export function ChatWidget() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedModel] = useState("gpt-4o-mini") // Default to fastest model for widget

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
    },
  })

  if (!session) {
    return null
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleSubmit(e)
  }

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium mb-1">Hi there! 👋</h3>
                    <p className="text-sm text-gray-600">How can I help you today?</p>
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.role === "user" ? (
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white rounded-lg px-3 py-2 max-w-[80%] text-sm">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%] text-sm">{message.content}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <form onSubmit={onSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me anything..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      onSubmit(e as any)
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
              <div className="mt-2 text-center">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false)
                    window.open("/chat", "_blank")
                  }}
                  className="text-xs text-gray-500 h-auto p-0"
                >
                  Open full chat →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
