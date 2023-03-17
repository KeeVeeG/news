import Database from '@ioc:Adonis/Lucid/Database'
import { TinyPNG } from 'tinypng'

const tinyClient = new TinyPNG('TCZ65XXXlvlySHh3WQ62p8QktsqPYkff')

export const compress = async (url: string) => {
  try {
    const result = await tinyClient.compress(url)
    return Buffer.from(result.data)
  } catch {
    return null
  }
}

const tiny = async (url: string): Promise<string | null> => {
  if (!url) return null
  const exists = await Database.from('imgs').where({ url }).first()
  if (exists) {
    return exists.id
  } else {
    const format = url.split('.').reverse()[0]
    const data = await compress(url)
    const [{ id }] = await Database.table('imgs').insert({ url, data, format }).returning('id')
    return `${id}.${format}`
  }
}

export default tiny
