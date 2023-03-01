import Application from '@ioc:Adonis/Core/Application'
import Database from '@ioc:Adonis/Lucid/Database'
import Migrator from '@ioc:Adonis/Lucid/Migrator'

export default async () => {
  // await Database.rawQuery('DROP SCHEMA public CASCADE;CREATE SCHEMA public;')

  const migrator = new Migrator(Database, Application, { direction: 'up', dryRun: false })
  await migrator.run()

  console.log(migrator.migratedFiles)

  if (Object.keys(migrator.migratedFiles).length <= 1) return
}
