import Database from '@ioc:Adonis/Lucid/Database'
import { compress } from 'App/Common/tiny'

export default class IgnoreController {
  async index() {
    const rows = await Database.from('imgs').whereNull('data').orderBy('id').limit(500)
    for (const { id, url } of rows) {
      await Database.from('imgs')
        .where({ id })
        .update({ data: await compress(url) })
    }
  }
}
