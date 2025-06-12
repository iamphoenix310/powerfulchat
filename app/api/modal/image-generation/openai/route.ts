// src/app/api/modal/image-generation/openai/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      aspect_ratio = "1:1",
      number_of_images = 1,
      quality = "high",
      background = "auto",
      moderation = "auto",
      output_format = "webp",
      output_compression = 90,
    } = await req.json();

    // Set correct OpenAI API Key for Replicate's model
    const openai_api_key = process.env.OPENAI_API_KEY;

    const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "openai/gpt-image-1",
        input: {
          prompt,
          quality,
          background,
          moderation,
          aspect_ratio,
          output_format,
          openai_api_key,
          number_of_images,
          output_compression,
        },
      }),
    });

    if (!replicateRes.ok) {
      const err = await replicateRes.text();
      throw new Error(`Replicate API failed: ${err}`);
    }

    let prediction = await replicateRes.json();

    // Poll for completion
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await new Promise((r) => setTimeout(r, 1500));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      });
      prediction = await poll.json();
    }

    if (prediction.status === "failed") {
      return NextResponse.json({ error: prediction.error || "Generation failed" }, { status: 500 });
    }

    // output can be array of urls or objects with .url property
    let urls: string[] = [];

    if (Array.isArray(prediction.output)) {
      urls = prediction.output.map((item: any) =>
        typeof item === "string"
          ? item
          : typeof item?.url === "function"
          ? item.url()
          : item?.url || ""
      );
    } else if (typeof prediction.output === "string") {
      urls = [prediction.output];
    }

    urls = urls.filter(Boolean);

    if (!urls.length) {
      return NextResponse.json({ error: "No images returned" }, { status: 500 });
    }

    return NextResponse.json({ images: urls }, { status: 200 });
  } catch (err: any) {
    console.error("❌ OpenAI GPT Image Replicate API error:", err);
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
