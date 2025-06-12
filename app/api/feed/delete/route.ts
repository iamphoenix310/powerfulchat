import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import { client } from "@/app/utils/sanityClient"

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const rawUserId = session?.user?.id
    if (!rawUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const cleanUserId = rawUserId.replace(/^drafts\./, "")
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")
    if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 })

    const cleanPostId = postId.replace(/^drafts\./, "")

    // Fetch post
    const post = await client.fetch(
      `*[_type == "userFeed" && _id == $id][0]{ _id, author }`,
      { id: cleanPostId }
    )
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })
    if (post.author?._ref !== cleanUserId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 🔥 Delete all comments on the post
    const commentIds = await client.fetch(
      `*[_type == "userFeedComments" && post._ref == $id][]._id`,
      { id: cleanPostId }
    )
    for (const id of commentIds) {
      await client.delete(id)
    }

    // 🔥 Delete all likes referencing the post
    const likeIds = await client.fetch(
      `*[_type == "feedLike" && feed._ref == $id][]._id`,
      { id: cleanPostId }
    )
    for (const id of likeIds) {
      await client.delete(id)
    }

    // 🔥 Finally, delete the post itself
    await client.delete(post._id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("🔥 DELETE ERROR:", err.message || err)
    return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500 })
  }
}
