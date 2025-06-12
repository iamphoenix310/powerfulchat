// app/api/feed/comments/delete/route.ts
import { client } from "@/app/utils/sanityClient"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const commentId = searchParams.get("commentId")

  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId" }, { status: 400 })
  }

  try {
    const childCommentIds: string[] = await client.fetch(
      `*[_type == "userFeedComment" && parent._ref == $id]._id`,
      { id: commentId }
    )

    // Try deleting children first
    if (childCommentIds.length > 0) {
      const deleteChildren = client.transaction()
      childCommentIds.forEach((id) => deleteChildren.delete(id))
      await deleteChildren.commit()
    }

    await client.delete(commentId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Cascade delete error:", error)

    const message =
      error?.response?.statusCode === 409
        ? "This comment has replies. Please delete child comments first."
        : "Failed to delete comment"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
