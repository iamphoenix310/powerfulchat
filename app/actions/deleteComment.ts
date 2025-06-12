'use server'

import { client } from '@/app/utils/sanityClient'
import { revalidatePath } from 'next/cache'

export async function deleteComment(id: string) {
  try {
    await client.delete(id)
    return { success: true }
  } catch (err) {
    console.error('Failed to delete comment', err)
    return { success: false }
  }
}
