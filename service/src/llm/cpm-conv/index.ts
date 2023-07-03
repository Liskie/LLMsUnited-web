import * as process from 'process'
import crypto from 'crypto'
import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { sendResponse } from '../../utils'
import { isNotEmptyString } from '../../utils/is'
import type { ApiModel, ChatContext } from '../../types'
import type { RequestOptions, SendMessageOptions, SetProxyOptions, UsageResponse } from './types'
dotenv.config()

const ErrorCodeMessage: Record<string, string> = {
  401: '[OpenAI] 提供错误的API密钥 | Incorrect API key provided',
  403: '[OpenAI] 服务器拒绝访问，请稍后再试 | Server refused to access, please try again later',
  502: '[OpenAI] 错误的网关 |  Bad Gateway',
  503: '[OpenAI] 服务器繁忙，请稍后再试 | Server is busy, please try again later',
  504: '[OpenAI] 网关超时 | Gateway Time-out',
  500: '[OpenAI] 服务器繁忙，请稍后再试 | Internal Server Error',
}

const timeoutMs: number = !isNaN(+process.env.TIMEOUT_MS) ? +process.env.TIMEOUT_MS : 100 * 1000

let apiModel: ApiModel
const model = isNotEmptyString(process.env.CPM_API_MODEL) ? process.env.CPM_API_MODEL : 'cpm-conv'

if (!isNotEmptyString(process.env.CPM_APP_ID) || !isNotEmptyString(process.env.CPM_APP_KEY))
  throw new Error('Missing CPM_APP_ID or CPM_APP_KEY environment variable')

function getMd5Base64(s: string): string {
  if (s === null)
    return null

  const md5 = crypto.createHash('md5').update(s, 'utf8').digest()
  return Buffer.from(md5).toString('base64')
}

function getSignatureBase64(data: string, key: string): string {
  const hmacObj = crypto.createHmac('sha256', key).update(data, 'utf8')
  return Buffer.from(hmacObj.digest()).toString('base64')
}

async function chatReplyProcess(requestOptions: RequestOptions) {
  const { messages, maxLength, modelParams } = requestOptions
  // const { repetitionPenalty, ngramPenalty, temperature } = modelParams
  try {
    const sendMessageOptions: SendMessageOptions = {
      model,
      actionType: 'conv',
      messages,
      maxLength, // 4096
      modelParams,
    }

    const method = 'POST'
    const accept = '*/*'
    const contentType = 'application/json'
    const timestamp = new Date().getTime()
    const contentMd5 = getMd5Base64(JSON.stringify(sendMessageOptions))
    const mode = 'Signature'
    const nonce = uuidv4()
    const urlQueries = ''

    const sbuffer = [
      method,
      accept,
      contentType,
      timestamp.toString(),
      contentMd5,
      mode,
      nonce,
      urlQueries,
    ].join('\n')
    const signature = getSignatureBase64(sbuffer, process.env.CPM_APP_KEY)

    const headers = {
      'Content-Type': contentType,
      'Accept': accept,
      'X-Model-Best-Open-Ca-Time': timestamp.toString(),
      'Content-MD5': contentMd5,
      'X-Model-Best-Open-App-Id': process.env.CPM_APP_ID,
      'X-Model-Best-Open-Ca-Mode': mode,
      'X-Model-Best-Open-Ca-Nonce': nonce,
      'X-Model-Best-Open-Ca-Signature': signature,
    }

    const response = await axios.post(process.env.CPM_API_URL,
      sendMessageOptions,
      { headers })

    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    const code = error.statusCode
    global.console.log(error)
    if (Reflect.has(ErrorCodeMessage, code))
      return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
    return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the back-end console' })
  }
}

async function fetchUsage() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL

  if (!isNotEmptyString(OPENAI_API_KEY))
    return Promise.resolve('-')

  const API_BASE_URL = isNotEmptyString(OPENAI_API_BASE_URL)
    ? OPENAI_API_BASE_URL
    : 'https://api.openai.com'

  const [startDate, endDate] = formatDate()

  // 每月使用量
  const urlUsage = `${API_BASE_URL}/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`

  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  }

  const options = {} as SetProxyOptions

  try {
    // 获取已使用量
    const useResponse = await options.fetch(urlUsage, { headers })
    if (!useResponse.ok)
      throw new Error('获取使用量失败')
    const usageData = await useResponse.json() as UsageResponse
    const usage = Math.round(usageData.total_usage) / 100
    return Promise.resolve(usage ? `$${usage}` : '-')
  }
  catch (error) {
    global.console.log(error)
    return Promise.resolve('-')
  }
}

function formatDate(): string[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const lastDay = new Date(year, month, 0)
  const formattedFirstDay = `${year}-${month.toString().padStart(2, '0')}-01`
  const formattedLastDay = `${year}-${month.toString().padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`
  return [formattedFirstDay, formattedLastDay]
}

export type { ChatContext }

export { chatReplyProcess }
