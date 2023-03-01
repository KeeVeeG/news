import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Imgs extends BaseSchema {
  protected tableName = 'imgs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').index()
      table.string('url').notNullable().unique().index()
      table.specificType('data', 'bytea')
      table.string('format').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
