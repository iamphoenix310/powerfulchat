import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const imageId = searchParams.get('imageId')

  if (!imageId) return NextResponse.json({ comments: [] })

    const flat = await client.fetch(
      `*[_type == "imageComments" && image._ref == $imageId] | order(_createdAt asc) {
  _id, text, _createdAt, "parent": parent->_id, likes,
  user->{_id, username, image}
}`,
      { imageId }
    )
    
  const commentMap: Record<string, any> = {}
  const roots: any[] = []

  flat.forEach((comment: any) => {
    comment.replies = []
    commentMap[comment._id] = comment
  })

  flat.forEach((comment: any) => {
    const parentId = comment.parent
    if (parentId && commentMap[parentId]) {
      commentMap[parentId].replies.push(comment)
    } else {
      roots.push(comment)
    }
  })

  return NextResponse.json({ comments: roots })
}