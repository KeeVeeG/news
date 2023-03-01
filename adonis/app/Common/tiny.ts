import Database from '@ioc:Adonis/Lucid/Database'
import { TinyPNG } from 'tinypng'

const tinyClient = new TinyPNG('h9g8MN0bmWBRXd1cM9Y0ZTDdxFhKyc8X')

const tiny = async (url: string): Promise<string | null> => {
  if (!url) return null
  const exists = await Database.from('imgs').where({ url }).first()
  if (exists) {
    return exists.id
  } else {
    const format = url.split('.').reverse()[0]
    let data: Buffer | null = null
    try {
      const result = await tinyClient.compress(url)
      data = Buffer.from(result.data)
    } catch {}
    const [{ id }] = await Database.table('imgs').insert({ url, data, format }).returning('id')
    return `${id}.${format}`
  }
}

export default tiny
