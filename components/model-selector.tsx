'use client'

import { Model } from '@/lib/types/models'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import { isReasoningModel } from '@/lib/utils/registry'
import { Check, ChevronsUpDown, Lightbulb } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createModelId } from '../lib/utils'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

function groupModelsByTier(models: Model[]) {
  const grouped = {
    free: {} as Record<string, Model[]>,
    pro: {} as Record<string, Model[]>
  }

  models
    .filter(model => model.enabled)
    .forEach(model => {
      const tier = model.isFree ? 'free' : 'pro'
      const provider = model.provider

      if (!grouped[tier][provider]) {
        grouped[tier][provider] = []
      }

      grouped[tier][provider].push(model)
    })

  return grouped
}


export function ModelSelector({ models }: { models: Model[] }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

 useEffect(() => {
  const savedModel = getCookie('selectedModel')

  if (savedModel) {
    try {
      const model = JSON.parse(savedModel) as Model
      setValue(createModelId(model))
      return
    } catch (e) {
      console.error('Failed to parse saved model:', e)
    }
  }

  // ✅ Use default model if no cookie
  const defaultModel = models.find(m => m.defaultModel)
  if (defaultModel) {
    const defaultId = createModelId(defaultModel)
    setValue(defaultId)
    setCookie('selectedModel', JSON.stringify(defaultModel))
  }
}, [models])


  const handleModelSelect = (id: string) => {
    const newValue = id === value ? '' : id
    setValue(newValue)
    
    const selectedModel = models.find(model => createModelId(model) === newValue)
    if (selectedModel) {
      setCookie('selectedModel', JSON.stringify(selectedModel))
    } else {
      setCookie('selectedModel', '')
    }
    
    setOpen(false)
  }

  const selectedModel: Model | undefined = models.find(
    (model: Model) => createModelId(model) === value
  )
  const freeModelsOnly = models.filter((model) => model.enabled && model.isFree)



  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="text-sm rounded-full shadow-none focus:ring-0"
        >
          {selectedModel ? (
            <div className="flex items-center space-x-1">
              <Image
                src={`/providers/logos/${selectedModel.providerId}.svg`}
                alt={selectedModel.provider}
                width={18}
                height={18}
                className="bg-white rounded-full border"
              />
              <span
                className="text-xs font-medium truncate max-w-[100px]"
                title={selectedModel.name}
              >
                {selectedModel.name}
              </span>

              {isReasoningModel(selectedModel.id) && (
                <Lightbulb size={12} className="text-accent-blue-foreground" />
              )}
                      </div>
                    ) : (
                      'Select model'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search models..." />
                   <CommandList>
                    <CommandEmpty>No model found.</CommandEmpty>
                    {Object.entries(
                      freeModelsOnly.reduce((acc, model) => {
                        if (!acc[model.provider]) acc[model.provider] = []
                        acc[model.provider].push(model)
                        return acc
                      }, {} as Record<string, Model[]>)
                    ).map(([provider, models]) => (
                      <CommandGroup key={provider} heading={provider}>
                        {models.map((model) => {
                          const modelId = createModelId(model)
                          return (
                            <CommandItem
                              key={modelId}
                              value={modelId}
                              onSelect={handleModelSelect}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center space-x-2 overflow-hidden">
                                  <Image
                                    src={`/providers/logos/${model.providerId}.svg`}
                                    alt={model.provider}
                                    width={18}
                                    height={18}
                                    className="bg-white rounded-full border shrink-0"
                                  />
                                  <span className="text-xs font-medium max-w-[120px]">{model.name}</span>
                                </div>
                              <Check
                                className={`h-4 w-4 ${
                                  value === modelId ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    ))}
                  </CommandList>

        </Command>
      </PopoverContent>
    </Popover>
  )
}
