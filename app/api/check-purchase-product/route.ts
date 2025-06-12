import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { productId, userEmail } = await req.json()

  if (!productId || !userEmail) {
    return NextResponse.json({ hasPurchased: false })
  }

  const user = await client.fetch(`*[_type == "user" && email == $email][0]{ _id }`, { email: userEmail })
  if (!user?._id) return NextResponse.json({ hasPurchased: false })

  const purchase = await client.fetch(
    `*[_type == "productPurchase" && user._ref == $userId && product._ref == $productId][0]._id`,
    { userId: user._id, productId }
  )

  return NextResponse.json({ hasPurchased: !!purchase })
}
