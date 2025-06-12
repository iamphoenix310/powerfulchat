import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // or 'gpt-3.5-turbo' if you want to use a cheaper model
       messages: [
          {
            role: 'system',
            content: `You are an expert resume and cover letter writer. Always follow the user's requested structure and formatting. Do not use Markdown or special characters. Always output clear plain text with visually separated sections, bullet points (as "-", never "*" or numbers), and context-rich content.`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 900,
        temperature: 0.7,
      }),
    })

    const data = await openaiRes.json()
    const text = data.choices?.[0]?.message?.content ?? ''

    return NextResponse.json({ text })
  } catch (err) {
    console.error('Resume Generator Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
