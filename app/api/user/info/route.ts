// app/api/user/info/route.ts
import { client } from "@/app/utils/sanityClient"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 })

  const data = await client.fetch(
    `*[_type == "user" && _id == $id][0]{
      _id, username, verified, bio, profileImage, socialLinks,
      "followers": followers[]->_id,
      "following": following[]->_id
    }`,
    { id }
  )

  return NextResponse.json(data || {})
}
