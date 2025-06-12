import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import { client } from "@/app/utils/sanityClient"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const rawUserId = session?.user?.id

    if (!rawUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 🧼 Strip draft prefix
    const cleanUserId = rawUserId.replace(/^drafts\./, "")
    const { postId, text, parentId } = await req.json()

    if (!postId || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const cleanPostId = postId.replace(/^drafts\./, "")

    const newComment = {
      _type: "userFeedComments",
      text,
      post: { _type: "reference", _ref: cleanPostId },
      user: { _type: "reference", _ref: cleanUserId },
      parent: parentId ? { _type: "reference", _ref: parentId.replace(/^drafts\./, "") } : undefined,
    }

    const created = await client.create(newComment)

    return NextResponse.json(created)
  } catch (err: any) {
    console.error("[FEED COMMENT ERROR]", err.message || err)
    return NextResponse.json({ error: "Failed to comment" }, { status: 500 })
  }
}
