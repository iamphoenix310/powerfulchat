export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  model?: string
}

export interface ChatConversation {
  _id?: string
  _type: "conversation"
  title: string
  messages: ChatMessage[]
  userId: string
  model: string
  createdAt: string
  updatedAt: string
}

export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  maxTokens: number
  costPer1k: number
}

export const availableModels: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Most capable model, best for complex tasks",
    maxTokens: 128000,
    costPer1k: 0.03,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Faster and more affordable",
    maxTokens: 128000,
    costPer1k: 0.0015,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "Fast and efficient for most tasks",
    maxTokens: 16385,
    costPer1k: 0.001,
  },
]
