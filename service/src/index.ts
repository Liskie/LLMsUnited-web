import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './llm/chatgpt'
import { chatConfig, chatReplyProcess as chatReplyProcessChatGPT, currentModel } from './llm/chatgpt'
import { chatReplyProcess as chatReplyProcessCPM } from './llm/cpm-conv'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import type { Message, ModelParams } from './llm/cpm-conv/types'

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process/chatgpt', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcessChatGPT({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/chat-process/cpm-conv', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  const modelParams: ModelParams = {
    repetitionPenalty: 1.02,
    ngramPenalty: 1.02,
    temperature: 1.02,
  }

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    modelParams.temperature = temperature
    const latestMessage: Message = {
      role: 'USER',
      content: prompt,
    }
    await chatReplyProcessCPM({
      // message, maxLength, modelParam
      messages: [latestMessage],
      // lastContext: options,
      maxLength: 4096,
      // systemMessage,
      modelParams,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3006, () => globalThis.console.log('Server is running on port 3006'))
