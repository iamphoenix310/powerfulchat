import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 })
    }

    const result = await client
      .patch(id)
      .set({ isRead: true })
      .commit({ autoGenerateArrayKeys: true })

    console.log('✅ Marked notification as read:', result._id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error marking notification as read:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
