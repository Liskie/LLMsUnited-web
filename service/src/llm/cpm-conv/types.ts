import type fetch from 'node-fetch'

// export interface RequestOptions {
//   message: string
//   lastContext?: { conversationId?: string; parentMessageId?: string }
//   process?: (chat: ChatMessage) => void
//   systemMessage?: string
//   temperature?: number
//   top_p?: number
// }

export interface ModelParams {
  repetitionPenalty: number
  ngramPenalty: number
  temperature: number
}

export interface Message {
  role: string
  content: string
}

export interface RequestOptions {
  messages: Array<Message> // [{ role: 'USER', content: '盼望着，盼望着，东风来了，春天的脚步近了。请续写' }],
  maxLength: number
  modelParams: ModelParams
}

export interface SendMessageOptions {
  model: string
  actionType: string
  messages: Array<Message> // [{ role: 'USER', content: '盼望着，盼望着，东风来了，春天的脚步近了。请续写' }],
  maxLength: number
  modelParams: ModelParams
}

export interface RequestHeaders {
  'Content-Type': 'application/json'
  'Accept': '*/*'
  'X-Model-Best-Open-Ca-Time': string
  'Content-MD5': string
  'X-Model-Best-Open-App-Id': string
  'X-Model-Best-Open-Ca-Mode': 'Signature'
  'X-Model-Best-Open-Ca-Nonce': string
  'X-Model-Best-Open-Ca-Signature': string
}

export interface SetProxyOptions {
  fetch?: typeof fetch
}

export interface UsageResponse {
  total_usage: number
}
