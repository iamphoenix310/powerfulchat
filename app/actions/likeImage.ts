'use server'

import { client } from '@/app/utils/sanityClient'
import { revalidatePath } from 'next/cache'
import { createNotification } from './createNotification'

async function getUserIdFromEmail(emailOrId: string): Promise<string | null> {
  if (emailOrId.includes('@')) {
    const userDoc = await client.fetch(
      `*[_type == "user" && email == $email][0]{ _id }`,
      { email: emailOrId }
    )
    return userDoc?._id || null
  }
  return emailOrId
}

export async function likeImageAction(imageId: string, userIdOrEmail: string) {
  try {
    const userId = await getUserIdFromEmail(userIdOrEmail)
    if (!userId) throw new Error('User not found')

    // Check if already liked
    const alreadyLiked = await client.fetch(
      `count(*[_type == "images" && _id == $imageId && $userId in likedBy[]._ref]) > 0`,
      { imageId, userId }
    )

    if (alreadyLiked) {
      return { success: false, message: 'Already liked' }
    }

    await client
      .patch(imageId)
      .setIfMissing({ likes: 0, likedBy: [] })
      .inc({ likes: 1 })
      .append('likedBy', [{ _type: 'reference', _ref: userId }])
      .commit()

    // Optional: Fetch image slug/creator for notifications
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
    return { success: true }
  } catch (err) {
    console.error('❌ likeImageAction error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function unlikeImageAction(imageId: string, userIdOrEmail: string) {
  try {
    const userId = await getUserIdFromEmail(userIdOrEmail)
    if (!userId) throw new Error('User not found')

    await client
      .patch(imageId)
      .dec({ likes: 1 })
      .unset([`likedBy[_ref == "${userId}"]`])
      .commit()

    return { success: true }
  } catch (err) {
    console.error('❌ unlikeImageAction error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
