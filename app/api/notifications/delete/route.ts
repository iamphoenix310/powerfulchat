import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 })
    }

    await client.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting notification:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
