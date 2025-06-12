import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'
import { createNotification } from '@/app/actions/createNotification'

export async function POST(req: Request) {
  const { imageId, userId } = await req.json()

  if (!imageId || !userId) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
  }

  try {
    // 🧼 Strip `drafts.` prefix from userId to avoid invalid references
    const cleanUserId = userId.replace(/^drafts\./, '')

    const updated = await client
      .patch(imageId)
      .setIfMissing({ likes: 0, likedBy: [] })
      .insert('after', 'likedBy[-1]', [{ _type: 'reference', _ref: cleanUserId }])
      .inc({ likes: 1 })
      .commit({ autoGenerateArrayKeys: true })

    const fresh = await client.fetch(
      `*[_type == "images" && _id == $imageId][0]{ likes, likedBy[]->{_id} }`,
      { imageId }
    )

    const imageData = await client.fetch(
      `*[_type == "images" && _id == $imageId][0]{ title, "slug": slug.current, "creatorId": creator->_id }`,
      { imageId }
    )

    if (imageData?.creatorId && imageData?.slug) {
      await createNotification({
        userId: imageData.creatorId,
        title: 'Someone liked your image ❤️',
        message: `Your image "${imageData.title}" was liked.`,
        link: `/images/${imageData.slug}`,
      })
    }

    return NextResponse.json({
      success: true,
      likes: fresh.likes,
      likedBy: fresh.likedBy,
    })
  } catch (err) {
    console.error('[LIKE ERROR]', err)
    return NextResponse.json({ success: false, error: 'Failed to like image' }, { status: 500 })
  }
}
