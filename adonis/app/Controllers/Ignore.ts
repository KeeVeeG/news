import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { someInIgnore, inIgnore } from 'App/Common/inIgnore'
import { JSDOM } from 'jsdom'

export default class IgnoreController {
  async index({ logger }: HttpContextContract) {
    console.time('Update ignore')
    const rows = await Database.from('news').select(['id', 'title', 'tags', 'html', 'url']).orderBy('id')
    await Database.transaction(async (trx) => {
      for (const { id, title, tags, html, url } of rows) {
        logger.info('ignore calc', {id})
        const set = async (hidden: boolean) => {
          await trx.from('news').where({ id }).update({ hidden })
        }
        if (someInIgnore([title, ...tags, url])) {
          await set(true)
          continue
        }
        try {
          const dom = new JSDOM(html).window.document.querySelector('.single__content')
          if (inIgnore(dom.textContent)) {
            await set(true)
            continue
          }
        } catch (e) {
          logger.warn(e)
          await set(true)
          continue
        }
        await set(false)
      }
    })
    console.timeEnd('Update ignore')
  }
}
