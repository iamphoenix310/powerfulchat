import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const modalResponse = await fetch("https://powerful--openai-image-caller-openai-image-app.modal.run/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await modalResponse.json()

    return NextResponse.json(data)

  } catch (error) {
    console.error("Proxying to Modal failed:", error)
    return NextResponse.json({ error: "Proxy to Modal Failed" }, { status: 500 })
  }
}
