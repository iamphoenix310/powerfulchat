import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('❌ No file received in form data')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString('base64')}`

    // POST to Replicate's HTTP API directly
    const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
        input: {
          image: base64,
          format: 'png',
          reverse: false,
          threshold: 0,
          background_type: 'rgba',
        },
      }),
    });

    if (!replicateRes.ok) {
      const error = await replicateRes.text();
      throw new Error('Replicate API error: ' + error);
    }

    let prediction = await replicateRes.json();

    // Wait for prediction to finish (polling)
    while (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed'
    ) {
      await new Promise((res) => setTimeout(res, 2000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` },
      });
      prediction = await pollRes.json();
    }

    if (prediction.status === 'failed') {
      // Show error from Replicate if available
      const errorMsg = prediction.error || 'Prediction failed';
      return NextResponse.json({ error: errorMsg, raw: prediction }, { status: 500 });
    }

    // Support both array and string output!
    let outputUrl: string | null = null;
    if (Array.isArray(prediction.output)) {
      outputUrl = prediction.output[0];
    } else if (typeof prediction.output === 'string') {
      outputUrl = prediction.output;
    }

    if (!outputUrl) {
      return NextResponse.json(
        { error: 'No image output from Replicate', raw: prediction },
        { status: 500 }
      );
    }


    return NextResponse.json({ outputUrl }, { status: 200 });

  } catch (err: any) {
    console.error('❌ Replicate API error:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
