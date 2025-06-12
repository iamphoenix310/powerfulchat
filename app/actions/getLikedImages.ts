// app/actions/getLikedImages.ts
'use server'

import { client } from '@/app/utils/sanityClient'

export async function getLikedImagesByUser(email: string) {
  const query = `*[_type == "images" && $email in likedBy] | order(_createdAt desc) {
    _id,
    title,
    slug,
    image,
    likes
  }`

  return await client.fetch(query, { email })
}
