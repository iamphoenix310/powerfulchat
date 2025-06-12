import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const notifications = await client.fetch(
      `*[_type == "notification" && user._ref == $userId]{ _id }`,
      { userId }
    )

    const tx = client.transaction()
    notifications.forEach((n: { _id: string }) => tx.delete(n._id))
    await tx.commit()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error clearing notifications:', error)
    return NextResponse.json({ error: 'Failed to clear' }, { status: 500 })
  }
}
