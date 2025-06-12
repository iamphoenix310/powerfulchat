import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import { newsClient } from "@/app/utils/sanityClient"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const conversations = await newsClient.fetch(
      `*[_type == "conversation" && userId == $userId] | order(updatedAt desc) [0...50]`,
      { userId: (session.user as any).id },
    )

    return Response.json(conversations)
  } catch (error) {
    console.error("Conversations API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { conversationId } = await req.json()

    await newsClient.delete(conversationId)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Delete conversation error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
