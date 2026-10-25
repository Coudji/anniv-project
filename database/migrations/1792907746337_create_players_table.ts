import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'players'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('pseudo').notNullable().unique()
      table.integer('cat1').notNullable().defaultTo(0)
      table.integer('cat2').notNullable().defaultTo(0)
      table.integer('cat3').notNullable().defaultTo(0)
      table.integer('cat4').notNullable().defaultTo(0)
      table.integer('cat5').notNullable().defaultTo(0)
      table.integer('cat6').notNullable().defaultTo(0)
      table.integer('cat7').notNullable().defaultTo(0)
      table.integer('cat8').notNullable().defaultTo(0)
      table.integer('cat9').notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
