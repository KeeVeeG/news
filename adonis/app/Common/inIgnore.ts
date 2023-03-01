import * as fs from 'fs'
import path from 'path'

export const ignorelist = fs
  .readFileSync(path.join(__dirname, '/../../ignore-list.txt'))
  .toString()
  .split('\n')
  .map((e) => e.trim())

export const inIgnore = (str: string): boolean => {
  const reg = new RegExp(ignorelist.map((e) => `(${e})`).join('|'), 'im')
  return reg.test(str)
}
