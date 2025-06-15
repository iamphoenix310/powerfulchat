import { createListenerStreamResponse } from '@/lib/streaming/create-listener-stream'
import { createManualToolStreamResponse } from '@/lib/streaming/create-manual-tool-stream'
import { createToolCallingStreamResponse } from '@/lib/streaming/create-tool-calling-stream'
import type { BaseStreamConfig } from '@/lib/streaming/types'

export type AgentHandler = (config: BaseStreamConfig) => Response | Promise<Response>

const handlers: Record<string, AgentHandler> = {
  listener: createListenerStreamResponse
}

export function getAgentForMode(mode: string): AgentHandler {
  if (handlers[mode]) {
    return handlers[mode]
  }

  return (config: BaseStreamConfig) => {
    const supportsToolCalling = config.model.toolCallType === 'native'
    return supportsToolCalling
      ? createToolCallingStreamResponse(config)
      : createManualToolStreamResponse(config)
  }
}
