import { validateModel } from '@/lib/models/validate-model'; // assume it’s separated
import { Model } from '@/lib/types/models';
import defaultModels from './default-models.json';

export async function getModels(): Promise<Model[]> {
  // Only return GPT-4o mini from default
  if (
    Array.isArray(defaultModels.models) &&
    defaultModels.models.every(validateModel)
  ) {
    return defaultModels.models.filter(model => model.id === 'gpt-4o-mini')
  }

  return []
}
