// src/app/api/mail/ses-handler/route.ts
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Log confirmation message
  if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
    console.log("🔗 Confirmation URL:", body.SubscribeURL)
  }

  console.log("📩 SES Notification Received:", body)
  return new Response("OK", { status: 200 })
}

export async function GET(req: NextRequest) {
  return new Response("SES Handler Ready", { status: 200 })
}
