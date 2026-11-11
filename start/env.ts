/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Chemin de la base SQLite (par défaut storage/db.sqlite3). En production, la placer
  // hors du dossier build/ pour que la progression survive à un nouveau build.
  DB_FILE: Env.schema.string.optional(),

  // Binaire SQLite compilé sur place (better_sqlite3.node), quand celui fourni par le
  // paquet ne marche pas sur le serveur (glibc trop ancienne, ex : Oracle Linux 8)
  SQLITE_BINDING: Env.schema.string.optional(),

  // Code secret du mode triche (laisser vide pour le désactiver)
  TRICHE_CODE: Env.schema.string.optional(),
})
