import _path from 'path'
import puppeteer from 'puppeteer'
import tiny from './tiny'
import Database from '@ioc:Adonis/Lucid/Database'
import { generatePath } from './generatePath'
import Logger from '@ioc:Adonis/Core/Logger'

const parser = async (url: string) => {
  const exists = await Database.from('news').where({ url }).first()
  if (exists) return

  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(url)
  await page.setViewport({ width: 1280, height: 720 })

  const titleEl = await page.$('.single__title')
  const title = (await titleEl?.evaluate((e) => e.textContent)) as string
  let path = generatePath(title)

  const dateEl = await page.$('.header-meta__statistics time')
  const date = await dateEl?.evaluate((e) => e.dateTime)

  const colorEl = await page.$('.single__header')
  const color = (await colorEl?.evaluate(
    (e) => e.style.backgroundImage.match(/#[\d\w]+(?=,)/)?.[0] || '#00000000'
  )) as string

  const tagEls = await page.$$('.tp-tag__link__text')
  const tags = (await Promise.all(tagEls.map((e) => e.evaluate((e) => e.textContent)))) as string[]

  //@ts-ignore
  const html = await page.evaluate(() => document.documentElement.outerHTML)

  const imgEl = await page.$('.single__container-icon img')
  const img = await tiny(await imgEl?.evaluate((e) => e.src))

  await browser.close()

  const result = {
    date,
    url,
    path,
    title,
    color,
    img,
    tags,
    html,
  }

  try {
    await Database.table('news').insert(result)
  } catch (e) {
    Logger.warn(e)
  }
  return result
}

export default parser
