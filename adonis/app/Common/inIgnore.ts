import * as fs from 'fs'
import path from 'path'

export const ignorelist = fs
  .readFileSync(path.join(__dirname, '/../../ignore-list.txt'))
  .toString()
  .split('\n')
  .map((e) => e.trim())

export const ignoreRegExp = new RegExp(ignorelist.map((e) => `(${e})`).join('|'), 'im')

export const inIgnore = (str: string): boolean => {
  const match = str.match(ignoreRegExp)?.[0]
  return !!match
}

export const someInIgnore = (arr: string[]): boolean => {
  return arr.some((e) => inIgnore(e))
}
