import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  const { articleId, authorId, content, parentComment } = await req.json()

  if (!articleId || !authorId || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const doc = {
    _type: 'articleComments',
    article: { _type: 'reference', _ref: articleId },
    author: { _type: 'reference', _ref: authorId },
    content,
    createdAt: new Date().toISOString(),
    ...(parentComment && { parentComment: { _type: 'reference', _ref: parentComment } }),
  }

  try {
    await client.create(doc)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 })
  }
}
