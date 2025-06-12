// utils/stripMarkdown.ts

export function stripMarkdown(md: string) {
  // Remove bold (**text**) and italic (*text* or _text_)
  let text = md.replace(/\*\*(.*?)\*\*/g, '$1')
  text = text.replace(/\*(.*?)\*/g, '$1')
  text = text.replace(/_(.*?)_/g, '$1')
  // Remove inline links [text](url)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '$1')
  // Remove any [bracketed placeholders]
  text = text.replace(/\[(.*?)\]/g, '$1')
  // Remove headers (##, ###, etc)
  text = text.replace(/^#+\s/gm, '')
  // Remove horizontal rules
  text = text.replace(/^-{3,}$/gm, '')
  // Remove unordered/ordered list indicators
  text = text.replace(/^\s*[-*+]\s+/gm, '')
  text = text.replace(/^\s*\d+\.\s+/gm, '')
  // Remove extra lines
  text = text.replace(/\n{2,}/g, '\n')
  return text.trim()
}
