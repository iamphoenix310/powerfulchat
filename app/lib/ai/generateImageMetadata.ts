'use server'

import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateImageMetadata(imageUrl: string) {
  const input = {
    image: imageUrl,
    top_p: 0.9,
    max_tokens: 512,
    temperature: 0.7,
    system_prompt:
      'You are an AI trained to help content creators enrich image metadata for search engines, accessibility, and creativity.',
    prompt: `
Analyze the image and return a well-formatted JSON object with the following fields:
{
  "title": "[a short, creative title for the image, 4-5 words only]",
  "description": "[a 1-2 sentence smart description]",
  "tags": [array of 5 to 10 lowercase relevant keywords – no hashtags],
  "altText": "[a concise visual description for accessibility]",
  "prompt": "[write only a highly detailed, professional generative prompt with strong visual language, no introduction, no quotes, no extra text]"
}
`,
  }

  let outputText = ''

  for await (const event of replicate.stream('ibm-granite/granite-vision-3.2-2b', { input })) {
    outputText += event.toString()
  }

  try {
    const metadata = JSON.parse(outputText)

    return {
      title: metadata.title || '',
      description: metadata.description || '',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      altText: metadata.altText || '',
      prompt: metadata.prompt || '',
    }
  } catch (err) {
    console.error('Failed to parse metadata JSON from Replicate output:', outputText)
    throw new Error('Invalid response format from AI')
  }
}
