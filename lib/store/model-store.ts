import { create } from 'zustand'

type ModelStore = {
  currentModelId: string
  setModelId: (id: string) => void
}

export const useModelStore = create<ModelStore>((set) => ({
  currentModelId: 'gpt-4.1-mini',
  setModelId: (id) => set({ currentModelId: id }),
}))
