import Database from '@ioc:Adonis/Lucid/Database'
import CyrillicToTranslit from 'cyrillic-to-translit-js'

//@ts-ignore
const cyrillicToTranslit = new CyrillicToTranslit()

export const generatePath = (str: string) =>
  cyrillicToTranslit.transform(str.replace(/[^\d\wа-яё ]/gi, ''), '-').toLowerCase()

export const generatePathsForExists = async () => {
  const items = await Database.from('news').whereNull('path').select(['id', 'title'])
  await Database.transaction(async (trx) => {
    await Promise.all(
      items.map(async (e) => {
        await trx
          .from('news')
          .where(e)
          .update({ path: generatePath(e.title) })
      })
    )
  })
}
