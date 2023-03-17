import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import { generatePathsForExists } from 'App/Common/generatePath'

Route.post('', 'Parser.parse')

Route.get('gpt', 'Parser.gpt')

Route.post('path', async () => {
  await generatePathsForExists()
})

Route.get('post/:id', async ({ params }) => {
  const { id } = params
  const post = await Database.from('news').where({ path: id }).first()
  return post
})

Route.get('img/:id', async ({ params, response }) => {
  const [id] = params.id.split('.')
  const { data, format } = await Database.from('imgs').where({ id }).first()
  response.header('content-type', `image/${format}`)
  return data
})

Route.get('ignore', 'Ignore.index')

Route.get('tiny', 'Tiny.index')
