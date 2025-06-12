"use client"
import { Check, ChevronDown, Zap, Brain, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { availableModels, type AIModel } from "@/types/chat"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  disabled?: boolean
}

const getModelIcon = (modelId: string) => {
  if (modelId.includes("gpt-4o") && !modelId.includes("mini")) return <Brain className="w-4 h-4" />
  if (modelId.includes("mini")) return <Zap className="w-4 h-4" />
  return <Gauge className="w-4 h-4" />
}

const getModelBadge = (model: AIModel) => {
  if (model.id.includes("gpt-4o") && !model.id.includes("mini")) {
    return (
      <Badge variant="default" className="bg-purple-100 text-purple-800 text-xs">
        Premium
      </Badge>
    )
  }
  if (model.id.includes("mini")) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
        Fast
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-xs">
      Standard
    </Badge>
  )
}

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const currentModel = availableModels.find((m) => m.id === selectedModel) || availableModels[1]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between h-auto p-3 hover:bg-gray-50" disabled={disabled}>
          <div className="flex items-center gap-3">
            {getModelIcon(currentModel.id)}
            <div className="text-left">
              <div className="font-medium text-sm">{currentModel.name}</div>
              <div className="text-xs text-gray-500">{currentModel.provider}</div>
            </div>
            {getModelBadge(currentModel)}
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-2">
        {availableModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="p-3 cursor-pointer hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {getModelIcon(model.id)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{model.name}</span>
                    {getModelBadge(model)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{model.description}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${model.costPer1k}/1K tokens • {model.maxTokens.toLocaleString()} max tokens
                  </div>
                </div>
              </div>
              {selectedModel === model.id && <Check className="w-4 h-4 text-green-600" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
