'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateMetadataFromPrompt(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that returns structured metadata for AI-generated images.`,
        },
        {
          role: 'user',
          content: `Given this image prompt: "${prompt}", generate the following in valid JSON format:

{
  "title": "A short creative title having 5-7 words",
  "description": "1-3 sentence rich description",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "alt": "An alt text describing the image"
}`,
        },
      ],
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('Empty response from OpenAI')

    const jsonStart = content.indexOf('{')
    const jsonEnd = content.lastIndexOf('}')
    const jsonString = content.slice(jsonStart, jsonEnd + 1)

    const parsed = JSON.parse(jsonString)

    return {
      title: parsed.title?.trim() || '',
      description: parsed.description?.trim() || '',
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map((tag: string) => tag.trim().toLowerCase())
        : [],
      alt: parsed.alt?.trim() || '',
    }
  } catch (err) {
    console.error('[generateMetadataFromPrompt ERROR]', err)

    // Safe fallback to avoid frontend break
    return {
      title: '',
      description: '',
      tags: [],
      alt: '',
    }
  }
}
