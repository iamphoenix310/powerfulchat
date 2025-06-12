import { NextResponse } from "next/server"
import { client } from "@/app/utils/sanityClient"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

export const dynamic = "force-dynamic" // Ensure this is always fresh

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const rawUserId = session?.user?.id

    if (!rawUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cleanUserId = rawUserId.replace(/^drafts\./, "")
    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 })
    }

    const cleanPostId = postId.replace(/^drafts\./, "")

    // First check if the like already exists to prevent duplicates
    const existingLike = await client.fetch(
      `*[_type == "feedLike" && user._ref == $userId && feed._ref == $postId][0]._id`,
      { userId: cleanUserId, postId: cleanPostId },
    )

    let liked = false

    // Use a transaction to ensure atomicity of operations
    const transaction = client.transaction()

    if (existingLike) {
      // Unlike: delete feedLike + decrement
      transaction.delete(existingLike)
      transaction.patch(cleanPostId, (p) => p.dec({ likes: 1 }).setIfMissing({ likes: 0 }))
    } else {
      // Like: create feedLike + increment
      // First verify the post exists
      const postExists = await client.fetch(`*[_type == "userFeed" && _id == $postId][0]._id`, { postId: cleanPostId })

      if (!postExists) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 })
      }

      // Create unique ID with userId and postId to prevent duplicates
      const likeId = `like-${cleanUserId}-${cleanPostId}`

      transaction.createIfNotExists({
        _id: likeId,
        _type: "feedLike",
        user: { _type: "reference", _ref: cleanUserId },
        feed: { _type: "reference", _ref: cleanPostId },
        createdAt: new Date().toISOString(),
      })

      transaction.patch(cleanPostId, (p) =>
        p.setIfMissing({ likes: 0 }).inc({ likes: 1 })
      )
      
      liked = true
    }

    // Commit the transaction
    const result = await transaction.commit({ autoGenerateArrayKeys: true })

    // Get the updated post directly after the transaction
    const updatedPost = await client.fetch(
      `*[_type == "userFeed" && _id == $postId][0]{ 
        "likes": coalesce(likes, 0)
      }`,
      { postId: cleanPostId },
    )

    // Ensure we have a valid likes count
    const likesCount = updatedPost?.likes ?? (liked ? 1 : 0)

    console.log("API response:", { likes: likesCount, liked }) // Debug log

    return NextResponse.json(
      {
        likes: likesCount,
        liked,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      },
    )
  } catch (err: any) {
    console.error("[FEED LIKE ERROR]", err.message || err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
