'use server'

import { client } from '@/app/utils/sanityClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function likeComment(commentId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  return client
    .patch(commentId)
    .setIfMissing({ likes: [] })
    .append('likes', [{ _type: 'reference', _ref: session.user.id }])
    .commit()
}
