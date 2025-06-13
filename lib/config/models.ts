import { Model } from '@/lib/types/models'
import { getBaseUrl } from '@/lib/utils/url'
import defaultModels from './default-models.json'

export function validateModel(model: any): model is Model {
  return (
    typeof model.id === 'string' &&
    typeof model.name === 'string' &&
    typeof model.provider === 'string' &&
    typeof model.providerId === 'string' &&
    typeof model.enabled === 'boolean' &&
    (model.toolCallType === 'native' || model.toolCallType === 'manual') &&
    (model.toolCallModel === undefined ||
      typeof model.toolCallModel === 'string')
  )
}

function isFreeModel(model: Model): boolean {
  const freeIds = [
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'o3-mini',
    'gpt-4o-mini',
    'gemini-2.0-flash',
    'gemini-2.0-flash-thinking-exp-01-21',
  ]

  return freeIds.includes(model.id)
}

export async function getModels(): Promise<Model[]> {
  const isAllowedProvider = (providerId: string) =>
    providerId === 'openai' || providerId === 'google'

  try {
    const baseUrlObj = await getBaseUrl()
    const modelUrl = new URL('/config/models.json', baseUrlObj)

    try {
      const response = await fetch(modelUrl, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const text = await response.text()
      if (text.trim().toLowerCase().startsWith('<!doctype')) throw new Error('Invalid response')

      const config = JSON.parse(text)
      if (Array.isArray(config.models) && config.models.every(validateModel)) {
        return config.models
          .filter((m: Model) => isAllowedProvider(m.providerId))
          .map((m: Model) => ({
            ...m,
            isFree: isFreeModel(m),
            defaultModel: m.id === 'gpt-4.1-mini' // ✅ This sets default
          }))
      }
    } catch (error: any) {
      if (
        Array.isArray(defaultModels.models) &&
        defaultModels.models.every(validateModel)
      ) {
        return defaultModels.models
          .filter(m => isAllowedProvider(m.providerId))
          .map(m => ({ ...m, isFree: isFreeModel(m) })) // ✅ Mark free
      }
    }
  } catch (error) {
    console.warn('Model loading failed:', error)
  }

  return []
}
