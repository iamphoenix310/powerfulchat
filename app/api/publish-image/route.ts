import { NextResponse } from "next/server"
import { client } from "@/app/utils/sanityClient"
import { generateMetadataFromPrompt } from "@/app/actions/generateMetadataFromPrompt"

export async function POST(req: Request) {
  const { id } = await req.json()

  if (!id) return NextResponse.json({ error: "Missing image ID" }, { status: 400 })

  const image = await client.fetch(
    `*[_type == "imageGeneration" && _id == $id][0]{
      _id,
      prompt,
      userId,
      image,
      aspectRatio,
      model,
      _createdAt,
      "imageUrl": image.asset->url
    }`,
    { id }
  )

  if (!image || !image.image?.asset?._ref) {
    return NextResponse.json({ error: "Image not found or missing asset" }, { status: 404 })
  }

  let metadata
  try {
    metadata = await generateMetadataFromPrompt(image.prompt)
  } catch (e) {
    metadata = {
      title: "",
      description: "",
      tags: [],
      alt: "",
    }
  }

  const doc = {
    _type: "images",
    title: metadata.title || "Untitled",
    description: metadata.description || "",
    tags: metadata.tags || [],
    altText: metadata.alt || image.prompt,
    prompt: image.prompt,
    image: image.image,
    userId: image.userId,
    aspectRatio: image.aspectRatio || "1024x1024",
    model: image.model || "flux",
    publishedFromId: image._id,
    publishedAt: new Date().toISOString(),
  }

  // ✅ Create published image in main collection
  const created = await client.create(doc)

  // ✅ Patch status on original generated image
  await client.patch(image._id).set({ status: "published" }).commit()

  return NextResponse.json({ success: true, imageId: created._id })
}
