import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { uploadProductToSanity } from '@/app/lib/sanity/uploadProductToSanity'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const {
      title,
      description,
      tags,
      category,
      isPremium,
      price,
      unlockAfterPurchase,
      freeWithSubscription, // ✅ NEW
      attachedFiles,
      productImages,
      mainimage,
    } = await req.json()

    const result = await uploadProductToSanity({
      title,
      description,
      tags,
      category,
      isPremium,
      price,
      unlockAfterPurchase,
      freeWithSubscription, // ✅ pass to Sanity upload
      r2Files: attachedFiles,
      productImages,
      mainimage,
    })

    return NextResponse.json({ success: true, slug: result.slug, id: result.id })
  } catch (err) {
    console.error("❌ Upload Product Error:", err)
    return NextResponse.json({ error: 'Failed to upload product' }, { status: 500 })
  }
}
