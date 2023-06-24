import * as crypto from 'crypto'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

class OpenapiClient {
  static getMd5Base64(s: string): string {
    if (s === null)
      return null

    const md5 = crypto.createHash('md5').update(s, 'utf8').digest()
    return Buffer.from(md5).toString('base64')
  }

  static getSignatureBase64(data: string, key: string): string {
    const hmacObj = crypto.createHmac('sha256', key).update(data, 'utf8')
    return Buffer.from(hmacObj.digest()).toString('base64')
  }

  static async doHttpPost(appId: string, appKey: string): Promise<void> {
    const urlQueries = ''
    const bodyData = {
      model: 'cpm-conv',
      actionType: 'conv',
      message: [{ role: 'USER', content: '盼望着，盼望着，东风来了，春天的脚步近了。请续写' }],
      maxLength: 4096,
      modelParam: {
        repetitionPenalty: 1.02,
        ngramPenalty: 1.02,
        temperature: 1.02,
      },
    }
    const contentMd5 = OpenapiClient.getMd5Base64(JSON.stringify(bodyData))
    const method = 'POST'
    const accept = '*/*'
    const contentType = 'application/json'
    const timestamp = new Date().getTime()
    const mode = 'Signature'
    const nonce = uuidv4()

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
    const signature = OpenapiClient.getSignatureBase64(sbuffer, appKey)

    const headers = {
      'Content-Type': contentType,
      'Accept': accept,
      'X-Model-Best-Open-Ca-Time': timestamp.toString(),
      'Content-MD5': contentMd5,
      'X-Model-Best-Open-App-Id': appId,
      'X-Model-Best-Open-Ca-Mode': mode,
      'X-Model-Best-Open-Ca-Nonce': nonce,
      'X-Model-Best-Open-Ca-Signature': signature,
    }

    const apiUrl = 'https://api.modelbest.cn/openapi/v1/conversation'
    const response = await axios.post(apiUrl, bodyData, { headers })
    console.log('result:', response.data)
  }
}
