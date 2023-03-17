import _path from 'path'
import { Worker } from 'worker_threads'
import Database from '@ioc:Adonis/Lucid/Database'
import { JSDOM } from 'jsdom'
import tiny from './tiny'
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

const parser = async () => {
  const rows = await Database.from('news').whereNull('els').where({ hidden: false })
  for (const row of rows) {
    const { html, id } = row
    const dom = new JSDOM(html).window.document.querySelector('.single__content')
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
            els.push({
              tag: 'p',
              original: child.textContent,
              gpt: await callGpt(child.textContent),
            })
          }
          break
      }
    }

    gpt.terminate()

    await Database.from('news')
      .where({ id })
      .update({ els: JSON.stringify(els) })
  }
}

export default parser
