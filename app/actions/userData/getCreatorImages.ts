// /app/actions/userData/getCreatorImages.ts
'use server'

import { client } from '@/app/utils/sanityClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function getCreatorImages() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('Not authenticated')
  }

  // Find the user doc ID
  const userQuery = `*[_type == "user" && email == $email][0]{_id}`
  const userDoc = await client.fetch(userQuery, { email: session.user.email })

  if (!userDoc?._id) throw new Error('User not found')

  const imagesQuery = `
    *[_type == "images" && creator._ref == $creatorId] | order(_createdAt desc) {
      _id,
      title,
      slug,
      views,
      likes,
      downloads,
      adRevenueGenerated,
      isPremium,
      price,
      image,
      _createdAt
    }
  `

  return await client.fetch(imagesQuery, { creatorId: userDoc._id })
}
