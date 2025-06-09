// utils/renderWithCitations.ts

export function renderWithCitations(
  text: string,
  citationMap: Record<string, number>,
  modelId: string
): string {
  const numberToUrl = Object.entries(citationMap).reduce<Record<number, string>>((acc, [url, index]) => {
    acc[index] = url
    return acc
  }, {})

  return text.replace(/\[(\d+)\]/g, (_, numStr) => {
    const num = parseInt(numStr, 10)
    const url = numberToUrl[num]

    // For OpenAI and Gemini models, link if we have a match
    if (url) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">[${num}]</a>`
    }

    // For Gemini: gracefully leave unlinked [n] or remove
    if (modelId.includes('gemini')) {
      return '' // or `[${num}]` if you prefer to keep it
    }

    return `[${num}]` // fallback
  })
}
