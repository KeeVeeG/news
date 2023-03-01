import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class News extends BaseSchema {
  protected tableName = 'news'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.dateTime('date')
      table.boolean('hidden').defaultTo(false).index()
      table.string('url').notNullable().unique()
      table.string('path').notNullable().unique().index()
      table.string('title').notNullable().unique()
      table.string('color')
      table.string('img')
      table.specificType('tags', 'varchar[]').notNullable().index()
      table.jsonb('els').notNullable()
      table.text('html').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
