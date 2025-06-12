import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import { newsClient } from "@/app/utils/sanityClient"
import type { NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, model = "gpt-4o-mini", conversationId, title } = await req.json()

    // Save or update conversation in Sanity
    if (conversationId) {
      await newsClient
        .patch(conversationId)
        .set({ messages, updatedAt: new Date().toISOString(), model })
        .commit()
    } else if (title) {
      const created = await newsClient.create({
        _type: "conversation",
        title,
        messages,
        userId: (session.user as any).id,
        model,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return new Response(JSON.stringify({ conversationId: created._id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }


    const result = streamText({
      model: openai(model),
      messages: messages,
      system: `You are a helpful AI assistant named Powerful. Be concise, accurate, and friendly. 
               Current time: ${new Date().toLocaleString()}.
               User: ${session.user.name || "User"}`,
      maxTokens: 4000,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
