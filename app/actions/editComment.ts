'use server'

import { client } from '@/app/utils/sanityClient'

export async function editComment(id: string, text: string) {
  try {
    await client
      .patch(id)
      .set({ text })
      .commit()
    return { success: true }
  } catch (err) {
    console.error('Failed to update comment', err)
    return { success: false }
  }
}
