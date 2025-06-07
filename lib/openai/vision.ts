export const analyzeImagesWithPrompt = async ({
  prompt,
  base64Images,
}: {
  prompt: string
  base64Images: string[]
}) => {
  const res = await fetch('/api/vision/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, base64Images }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Vision API failed')
  return json.result as string
}
