import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { imageId, text, parentId } = await req.json()

  if (!imageId || !text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // 🧼 Clean user ID to remove "drafts." prefix if present
  const cleanUserId = session.user.id.replace(/^drafts\./, '')

  const newComment = {
    _type: 'imageComments',
    text,
    image: { _type: 'reference', _ref: imageId },
    user: { _type: 'reference', _ref: cleanUserId },
    parent: parentId ? { _type: 'reference', _ref: parentId } : undefined
  }

  const created = await client.create(newComment)

  return NextResponse.json(created)
}
