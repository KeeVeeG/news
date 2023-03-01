import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import { generatePathsForExists } from 'App/Common/generatePath'
import { ignorelist } from 'App/Common/inIgnore'

Route.post('', 'Parser.parse')

Route.post('path', async () => {
  await generatePathsForExists()
})

Route.get('post/:id', async ({ params }) => {
  const { id } = params
  const post = await Database.from('news').where({ path: id }).first()
  return post
})

Route.get('img/:id', async ({ params }) => {
  const [id] = params.id.split('.')
  const img = await Database.from('imgs').where({ id }).first()
  return img.data
})

Route.get('ignore', () => {
  return ignorelist
})
