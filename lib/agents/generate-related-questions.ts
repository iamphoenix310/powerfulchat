import { relatedSchema } from '@/lib/schema/related'
import { CoreMessage, generateObject, generateText } from 'ai'
import {
  getModel,
  getToolCallModel,
  isToolCallSupported
} from '../utils/registry'

export async function generateRelatedQuestions(
  messages: CoreMessage[],
  model: string
) {
  const lastUserMessages = messages.slice(-1).map(m => ({
    ...m,
    role: 'user'
  })) as CoreMessage[]

  const systemPrompt = `As a professional web researcher, your task is to generate a set of three queries that explore the subject matter more deeply, building upon the initial query and the information uncovered in its search results.

If the original question was "What caused the decline of the Harappan Civilization?", your output should look like:

Related:
- What were the environmental factors that contributed to the Harappan decline?
- How did trade routes affect the sustainability of Harappan cities?
- What archaeological evidence exists for natural disasters during that period?

Match the user's language. Keep each question concise and helpful.`

  const supportsToolCall = isToolCallSupported(model)
  const currentModel = supportsToolCall ? getModel(model) : getToolCallModel(model)

  try {
    if (supportsToolCall) {
      // ✅ Try tool-call-based generation first
      return await generateObject({
        model: currentModel,
        system: systemPrompt,
        messages: lastUserMessages,
        schema: relatedSchema
      })
    }
  } catch (err) {
    console.warn(`Tool call failed for ${model}, falling back to prompt-based generation.`)
  }

  // ✅ Always fallback to prompt-based generation for unsupported models
  const result = await generateText({
    model: currentModel,
    system: systemPrompt,
    messages: lastUserMessages
  })

  const text = result.text || ''
  const lines = text
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^- /, '').trim())
    .filter(Boolean)

  return {
    object: 'related',
    data: lines.slice(0, 3) // Always return max 3
  }
}
