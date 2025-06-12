import { client } from '@/app/utils/sanityClient'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const films = await client.fetch(`
      *[_type == "films"]{ _id, title, slug, poster, releaseDate }
    `)
    return NextResponse.json(films)
  } catch (err) {
    console.error('❌ Failed to fetch films:', err)
    return NextResponse.json({ error: 'Failed to fetch films' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Delete ALL
    if (body.deleteAll) {
      const films = await client.fetch(`*[_type == "films"]{ _id }`)
      const tx = client.transaction()
      films.forEach((f: any) => tx.delete(f._id))
      await tx.commit()
      return NextResponse.json({ success: true, deleted: films.length })
    }

    // Delete ONE
    const { id } = body
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    }

    await client.delete(id)
    return NextResponse.json({ success: true, deleted: id })
  } catch (err) {
    console.error('❌ Delete failed:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
