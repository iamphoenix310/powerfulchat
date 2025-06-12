import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { client } from '@/app/utils/sanityClient'

// Fetch all comments for a post
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')

  if (!postId) return NextResponse.json({ comments: [] })

  const flat = await client.fetch(
    `*[_type == "userFeedComments" && post._ref == $postId] | order(_createdAt asc) {
      _id,
      text,
      _createdAt,
      "parent": parent->_id,
      user->{_id, username, profileImage}
    }`,
    { postId }
  )

  const commentMap: Record<string, any> = {}
  const roots: any[] = []

  flat.forEach((c: any) => {
    c.replies = []
    commentMap[c._id] = c
  })

  flat.forEach((c: any) => {
    if (c.parent && commentMap[c.parent]) {
      commentMap[c.parent].replies.push(c)
    } else {
      roots.push(c)
    }
  })

  return NextResponse.json({ comments: roots })
}

// Submit a new comment or reply
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const rawUserId = session?.user?.id

  if (!rawUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId, text, parentId } = await req.json()
  if (!postId || !text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // 🧼 Clean all references
  const cleanUserId = rawUserId.replace(/^drafts\./, '')
  const cleanPostId = postId.replace(/^drafts\./, '')
  const cleanParentId = parentId?.replace(/^drafts\./, '')

  const newComment = {
    _type: 'userFeedComments',
    text,
    post: { _type: 'reference', _ref: cleanPostId },
    user: { _type: 'reference', _ref: cleanUserId },
    parent: cleanParentId ? { _type: 'reference', _ref: cleanParentId } : undefined,
  }

  const created = await client.create(newComment)
  return NextResponse.json(created)
}
