import { client } from '@/app/utils/sanityClient'

export async function getUniqueSlug(base: string, type: string): Promise<string> {
  let slug = base
  let counter = 1
  while (true) {
    const exists = await client.fetch(`count(*[_type == $type && slug.current == $slug])`, {
      type,
      slug
    })
    if (exists === 0) break
    slug = `${base}-${counter++}`
  }
  return slug
}
