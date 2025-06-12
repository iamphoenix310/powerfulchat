import { NextResponse } from "next/server"
import { client } from "@/app/utils/sanityClient"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const rawUserId = session?.user?.id
    if (!rawUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cleanUserId = rawUserId.replace(/^drafts\./, "")
    const { postId } = await req.json()
    const cleanPostId = postId.replace(/^drafts\./, "")

    const existingLike = await client.fetch(
      `*[_type == "feedLike" && user._ref == $userId && feed._ref == $postId][0]._id`,
      { userId: cleanUserId, postId: cleanPostId }
    )

    if (!existingLike) {
      return NextResponse.json({ error: "No existing like to remove" }, { status: 400 })
    }

    // ✅ Check current like count before decrementing
    const currentLikes: number = await client.fetch(
      `*[_type == "userFeed" && _id == $postId][0].likes`,
      { postId: cleanPostId }
    )

    const transaction = client.transaction().delete(existingLike)

    if ((currentLikes || 0) > 0) {
      transaction.patch(cleanPostId, (p) =>
        p.setIfMissing({ likes: 0 }).dec({ likes: 1 })
      )
    } else {
      transaction.patch(cleanPostId, (p) =>
        p.set({ likes: 0 }) // force reset to zero
      )
    }

    await transaction.commit({ autoGenerateArrayKeys: true })

    const updated = await client.fetch(
      `*[_type == "userFeed" && _id == $postId][0]{ "likes": coalesce(likes, 0) }`,
      { postId: cleanPostId }
    )

    return NextResponse.json({
      likes: updated?.likes || 0,
      liked: false,
    })
  } catch (err: any) {
    console.error("[UNLIKE ERROR]", err.message || err)
    return NextResponse.json({ error: "Failed to unlike" }, { status: 500 })
  }
}
