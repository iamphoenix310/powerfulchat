import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import { client } from "@/app/utils/sanityClient"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const rawUserId = session?.user?.id

  if (!rawUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cleanUserId = rawUserId.replace(/^drafts\./, "")
  const formData = await req.formData()
  const text = formData.get("text") as string
  const visibility = formData.get("visibility") as "public" | "followers"
  const image = formData.get("image") as File | null

  // ✅ Parse linkPreview from client
  const linkPreviewRaw = formData.get("linkPreview") as string | null
  let linkPreview = null
  if (linkPreviewRaw) {
    try {
      linkPreview = JSON.parse(linkPreviewRaw)
    } catch {
      linkPreview = null
    }
  }

  try {
    let imageAsset

    if (image && image.size > 0) {
      imageAsset = await client.assets.upload("image", image, {
        filename: image.name,
      })
    }

    const newDoc = {
      _id: `feed-${uuidv4()}`,
      _type: "userFeed",
      author: {
        _type: "reference",
        _ref: cleanUserId,
      },
      text,
      visibility,
      image: imageAsset
        ? {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: imageAsset._id,
            },
          }
        : undefined,
      linkPreview: linkPreview || undefined,
      createdAt: new Date().toISOString(),
    }

    await client.createIfNotExists(newDoc)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("[FEED POST ERROR]", error.message || error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
