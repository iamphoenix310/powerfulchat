import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const data = await client.fetch(
      `*[_type == "imageGeneration" && user._ref == $userId] | order(_createdAt desc)`,
      { userId }
    )
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[user-images API ERROR]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
