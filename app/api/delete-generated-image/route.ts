// app/api/delete-generated-image/route.ts
import { NextResponse } from "next/server"
import { client } from "@/app/utils/sanityClient"

export async function POST(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

  try {
    await client.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
