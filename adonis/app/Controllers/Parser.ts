import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import parser from 'App/Common/parser'
import gptParser from 'App/Common/gptParser'

export default class ParserController {
  async parse({ request, logger }: HttpContextContract) {
    const { url } = request.body()
    if (Array.isArray(url)) {
      const size = 6
      for (let i = 0; i < url.length; i += size) {
        const urls = url.slice(i, i + size)
        let success
        do {
          try {
            await Promise.all(
              urls.map(async (e) => {
                await parser(e)
              })
            )
            success = true
          } catch (e) {
            logger.warn(e)
          }
        } while (!success)
      }
    } else {
      return await parser(url)
    }
  }

  async gpt(){
    await gptParser()
  }
}
