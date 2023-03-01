import _path from 'path'
import { Worker } from 'worker_threads'
import puppeteer from 'puppeteer'
import { JSDOM } from 'jsdom'
import tiny from './tiny'
import Database from '@ioc:Adonis/Lucid/Database'
import { generatePath } from './generatePath'
import { inIgnore } from './inIgnore'

type pEl = {
  tag: 'p'
  original: string
  gpt: string | null
}

type h2El = {
  tag: 'h2'
  text: string
}

type imgEl = {
  tag: 'img'
  id: string | null
}

type videoEl = {
  tag: 'video'
  id: string
}

type codeEl = {
  tag: 'code'
  text: string
}

type El = pEl | h2El | imgEl | videoEl | codeEl

const parser = async (url: string) => {
  console.log(url)

  const exists = await Database.from('news').where({ url }).first()
  if (exists) return

  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(url)
  await page.setViewport({ width: 1280, height: 720 })

  const titleEl = await page.$('.single__title')
  const title = (await titleEl?.evaluate((e) => e.textContent)) as string
  const path = generatePath(title)

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
  const dom = new JSDOM(html).window.document.querySelector('.single__content')
  if (inIgnore(dom.textContent)) {
    await browser.close()
    return
  }

  const imgEl = await page.$('.single__container-icon img')
  const img = await tiny(await imgEl?.evaluate((e) => e.src))

  const childs = dom.children

  const gpt = new Worker(_path.join(__dirname, 'gpt'))
  const callGpt = (text: string): Promise<string> =>
    new Promise((resolve) => {
      gpt.postMessage(text)
      gpt.once('message', (data) => {
        resolve(data)
      })
    })

  const els: El[] = []

  const banner = dom.querySelector('img.wp-post-image')
  if (banner) {
    els.push({ tag: 'img', id: await tiny(banner.src) })
  }

  for (let i = 0; i < childs.length; i++) {
    const child = childs[i]
    const classes = [...child.classList]

    switch (child.tagName) {
      case 'P':
      case 'UL':
        let text = child.textContent
        if (!classes.length && text.length > 10) {
          while (text.length < 200) {
            const next = childs[i + 1]
            if (next && ['P', 'UL'].includes(next.tagName)) {
              i++
              text += next.textContent
            } else {
              break
            }
          }
          els.push({ tag: 'p', original: text, gpt: await callGpt(text) })
        }
        break

      case 'H2':
        els.push({ tag: 'h2', text: child.textContent })
        break

      case 'DIV':
        if (classes.includes('image-block')) {
          const url = child.getAttribute('data-image')
          els.push({ tag: 'img', id: await tiny(url) })
          const text = child.textContent
          if (text.length > 20) {
            els.push({ tag: 'p', original: text, gpt: await callGpt(text) })
          }
        } else if (classes.includes('video')) {
          const a = child.querySelector('a.video__link')
          if (a) {
            const id = a.getAttribute('data-video-id')
            if (id) {
              els.push({ tag: 'video', id })
            }
          }
        } else if (classes.includes('code-toolbar')) {
          els.push({ tag: 'code', text: child.textContent })
        } else if (classes.includes('tp-hint')) {
          els.push({ tag: 'p', original: child.textContent, gpt: await callGpt(child.textContent) })
        }
        break
    }
  }

  gpt.terminate()
  await browser.close()

  const result = {
    date,
    url,
    path,
    title,
    color,
    img,
    tags,
    els,
    html,
  }

  await Database.table('news').insert({ ...result, els: JSON.stringify(els) })
  return result
}

export default parser
