// app/lib/sanity/uploadProductToSanity.ts
'use server'

import { client } from '@/app/utils/sanityClient'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { revalidatePath } from 'next/cache'

const slugify = (str: string) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

export async function uploadProductToSanity({
  title,
  description,
  tags,
  category,
  isPremium,
  price,
  unlockAfterPurchase,
  freeWithSubscription, // ✅ Add this
  r2Files,
  productImages,
  mainimage, // ✅ Add this
}: {
  title: string
  description: string
  tags: string[]
  category: string
  isPremium: boolean
  price: string
  unlockAfterPurchase: boolean
  freeWithSubscription: boolean // ✅ Add this
  r2Files: any[]
  productImages: any[]
  mainimage: any // ✅ Add this type
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }

  const safeTitle = title?.trim() || `untitled-${uuidv4().slice(0, 6)}`
const slug = slugify(safeTitle)

const doc = {
    _type: 'products',
    _id: uuidv4(),
    title: safeTitle,
    slug: { _type: 'slug', current: slug },
    description,
    tags,
    category: category ? [{ _type: 'reference', _ref: category }] : [],
    isPremium,
    price,
    unlockAfterPurchase,
    freeWithSubscription, // ✅ Store in document
    attachedFiles: r2Files || [],
    productImages: productImages || [],
    mainimage: mainimage && mainimage.asset ? mainimage : undefined,
    creator: {
      _type: 'reference',
      _ref: session.user.id,
    },
    publishedAt: new Date().toISOString(),
  }



  const created = await client.create(doc)
  revalidatePath('/products')

  return {
    success: true,
    slug: created.slug?.current,
    id: created._id,
  }
}
