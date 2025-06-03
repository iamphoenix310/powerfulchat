import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const prompt = `Based on the user input "${query}", suggest 4 relevant, helpful questions or search queries they might want to ask. Make them specific and actionable. Return only a JSON array of strings, no other text.`

    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    })

    const content = res.choices[0]?.message?.content?.trim() ?? "[]"

    // Try to parse JSON, fallback to empty array if parsing fails
    let suggestions: string[] = []
    try {
      suggestions = JSON.parse(content)
      // Ensure it's an array and limit to 4 suggestions
      if (Array.isArray(suggestions)) {
        suggestions = suggestions.slice(0, 4)
      } else {
        suggestions = []
      }
    } catch (parseError) {
      console.warn("Failed to parse suggestions JSON:", parseError)
      suggestions = []
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Suggestions API error:", error)
    return NextResponse.json({ suggestions: [] }, { status: 500 })
  }
}
