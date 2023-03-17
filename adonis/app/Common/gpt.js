const { parentPort } = require('worker_threads')
const apiKey = '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'

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
      const req = 'increase the uniqueness of this text: \n' + text
      const res = await api.sendMessage(req)
      result = res.text
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
