import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import parser from 'App/Common/parser'

export default class ParserController {
  async parse({ request }: HttpContextContract) {
    const { url } = request.body()
    if (Array.isArray(url)) {
      for (const item of url) {
        await parser(item)
      }
    } else {
      return await parser(url)
    }
  }
}
