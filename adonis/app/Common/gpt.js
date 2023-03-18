const { parentPort } = require('worker_threads')
const apiKey = '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'
const PART = 1900

const send = async (text) => {
  let result
  while (!result) {
    try {
      const { ChatGPTAPI } = await import('chatgpt')
      const api = new ChatGPTAPI({
        apiKey,
        completionParams: {
          temperature: 0.5,
        },
      })
      const k = Math.ceil(text.length / PART)
      if(k > 1){
        const l = Math.ceil(text.length / k)
        let subresult = ''
        for(let i = 0; i < k; i++){
          const subtext = text.slice(i * PART, (i + 1) * PART)
          const req = 'increase the uniqueness of this text: \n' + subtext
          const res = await api.sendMessage(req)
          subresult += ' ' + res.text
        }
        result = subresult.trim()
      }else{
        const req = 'increase the uniqueness of this text: \n' + text
        const res = await api.sendMessage(req)
        result = res.text
      }
    } catch (e) {
      console.log(e)
      await new Promise((resolve) => {
        setTimeout(() => resolve(), 1000 * 60)
      })
    }
  }
  return result
}

parentPort.on('message', async (text) => {
  console.log(text)
  parentPort.postMessage(await send(text))
})
