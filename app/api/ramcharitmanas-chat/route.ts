import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const res = await fetch('https://powerful--ramcharitmanas-chat-lora-api-ramcharitmanasmodel-chat.modal.run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  return NextResponse.json({ response: data.response });
}
