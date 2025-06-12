import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { idea } = await req.json()

  const systemPrompt = `
Generate highly detailed, and in bright and white colored environment image prompt for the given topic. Return only the final prompt, without explanations or intros.`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: idea },
        ],
        temperature: 0.8,
      }),
    })

    const data = await res.json()
    const prompt = data?.choices?.[0]?.message?.content?.trim()
    return NextResponse.json({ prompt })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 })
  }
}
