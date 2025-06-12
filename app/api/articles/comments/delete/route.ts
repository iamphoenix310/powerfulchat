// /app/api/articles/comments/delete/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function DELETE(req: Request) {
  const { commentId, userId } = await req.json()

  if (!commentId || !userId) {
    return NextResponse.json({ error: 'Missing commentId or userId' }, { status: 400 })
  }

  // Fetch comment to validate ownership
  const comment = await client.fetch(
    `*[_type == "articleComments" && _id == $commentId][0]{ _id, author-> { _id } }`,
    { commentId }
  )

  if (!comment || comment.author._id !== userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    await client.delete(commentId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
