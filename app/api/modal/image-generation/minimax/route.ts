import { NextRequest, NextResponse } from "next/server";

// Helper to call Replicate
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_TOKEN) {
  throw new Error("Missing REPLICATE_API_TOKEN in env");
}

// POST: Start a new prediction, return predictionId
export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      aspect_ratio = "1:1",
      number_of_images = 1,
      prompt_optimizer = true,
      subject_reference,
    } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Build input for Replicate
    const input: any = {
      prompt,
      aspect_ratio,
      number_of_images,
      prompt_optimizer,
    };

    // Only add subject_reference if provided and non-empty
    if (subject_reference) {
      input.subject_reference = subject_reference;
    }

    // Start the Replicate prediction
    const replicateRes = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "minimax/image-01",
        input,
      }),
    });

    if (!replicateRes.ok) {
      const err = await replicateRes.text();
      return NextResponse.json({ error: `Replicate API failed: ${err}` }, { status: 500 });
    }

    const prediction = await replicateRes.json();

    // Immediately return predictionId, status, and an initial progress (0 or 5)
    return NextResponse.json({
      predictionId: prediction.id,
      status: prediction.status,
      progress: 5, // You can tweak this default if desired
    });
  } catch (err: any) {
    console.error("❌ MiniMax API error:", err);
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}

// GET: Poll the prediction status & progress
export async function GET(req: NextRequest) {
  try {
    const predictionId = req.nextUrl.searchParams.get("predictionId");
    if (!predictionId) {
      return NextResponse.json({ error: "Missing predictionId" }, { status: 400 });
    }

    // Poll Replicate for this prediction
    const pollRes = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });

    if (!pollRes.ok) {
      const err = await pollRes.text();
      return NextResponse.json({ error: `Replicate poll failed: ${err}` }, { status: 500 });
    }

    const prediction = await pollRes.json();

    // Map Replicate status to progress percent
    let progress = 5;
    let statusText = prediction.status;

    // If Replicate exposes progress (check metrics, logs, etc.):
    // Not all models provide percent, so this is heuristic.
    if (prediction.status === "starting") progress = 5;
    else if (prediction.status === "processing") progress = 40;
    else if (prediction.status === "succeeded") progress = 100;
    else if (prediction.status === "failed") progress = 0;

    // You can add more granularity based on prediction.logs or prediction.metrics if needed.

    // Parse output (may be string or array of objects/strings)
    let urls: string[] = [];
    if (prediction.status === "succeeded" && prediction.output) {
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
    }

    return NextResponse.json({
      status: prediction.status,
      progress,
      output: urls,
      statusText,
      error: prediction.error || null,
    });
  } catch (err: any) {
    console.error("❌ MiniMax GET Poll error:", err);
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
