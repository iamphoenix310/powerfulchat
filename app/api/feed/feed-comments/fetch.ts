// GET: /api/feed-comments/fetch?postId=abc123
import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')

  if (!postId) return NextResponse.json({ comments: [] })

  const flatComments = await client.fetch(
    `*[_type == "userFeedComments" && post._ref == $postId] | order(_createdAt asc) {
      _id, text, _createdAt, likes,
      "parent": parent->_id,
      user->{_id, username, profileImage}
    }`,
    { postId }
  )

  const commentMap: Record<string, any> = {}
  const roots: any[] = []

  flatComments.forEach((comment: any) => {
    comment.replies = []
    commentMap[comment._id] = comment
  })

  flatComments.forEach((comment: any) => {
    const parentId = comment.parent
    if (parentId && commentMap[parentId]) {
      commentMap[parentId].replies.push(comment)
    } else {
      roots.push(comment)
    }
  })

  return NextResponse.json({ comments: roots })
}
