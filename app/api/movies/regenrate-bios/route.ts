import { NextResponse } from 'next/server'
import { processCelebrityData } from '@/pages/api/processCelebData'

export async function POST(req: Request) {
  const { id, name } = await req.json()

  if (!id || !name) return NextResponse.json({ error: 'Missing id or name' }, { status: 400 })

  try {
    const result = await processCelebrityData(id)
    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to regenerate bio' }, { status: 500 })
  }
}
