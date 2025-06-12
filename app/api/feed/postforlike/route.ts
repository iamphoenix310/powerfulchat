import { NextResponse } from "next/server"
import { client } from "@/app/utils/sanityClient"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

export const dynamic = "force-dynamic" // Ensure this is always fresh data

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get("id")

  if (!postId) {
    return NextResponse.json({ error: "Missing post ID" }, { status: 400 })
  }

  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id?.replace(/^drafts\./, "")

    // Clean the post ID to ensure consistency
    const cleanPostId = postId.replace(/^drafts\./, "")

    // Get the post data and like status in a single query
    const result = await client.fetch(
      `{
        "post": *[_type == "userFeed" && _id == $postId][0]{
          _id,
          "likes": coalesce(likes, 0)
        },
        "likedByUser": defined(*[_type == "feedLike" && user._ref == $userId && feed._ref == $postId][0]),
        "likedBy": array::compact(*[_type == "feedLike" && feed._ref == $postId].user->_id)
      }`,
      { postId: cleanPostId, userId },
    )

    // If post doesn't exist, return 0 likes
    if (!result.post) {
      return NextResponse.json(
        {
          likes: 0,
          likedBy: [],
        },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        },
      )
    }

    // Set cache control headers to prevent stale data
    return NextResponse.json(
      {
        likes: result.post.likes,
        likedByUser: result.likedByUser, // ✅ This is important
        likedBy: result.likedBy || [],
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      },
    )
  } catch (err: any) {
    console.error("[GET POST LIKE ERROR]", err.message || err)
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 })
  }
}
