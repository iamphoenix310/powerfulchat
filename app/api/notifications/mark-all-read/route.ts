import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const unread = await client.fetch(
      `*[_type == "notification" && user._ref == $userId && isRead == false]{ _id }`,
      { userId }
    )

    const tx = client.transaction()
    unread.forEach((n: { _id: string }) => {
      tx.patch(n._id, (patch) => patch.set({ isRead: true }))
    })

    await tx.commit()


    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error in mark-all-read:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
