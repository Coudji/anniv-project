import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'players'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('pseudo').notNullable().unique()
      table.integer('cat_1').notNullable().defaultTo(0)
      table.integer('cat_2').notNullable().defaultTo(0)
      table.integer('cat_3').notNullable().defaultTo(0)
      table.integer('cat_4').notNullable().defaultTo(0)
      table.integer('cat_5').notNullable().defaultTo(0)
      table.integer('cat_6').notNullable().defaultTo(0)
      table.integer('cat_7').notNullable().defaultTo(0)
      table.integer('cat_8').notNullable().defaultTo(0)
      table.integer('cat_9').notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
