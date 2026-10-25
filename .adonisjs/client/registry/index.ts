/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'accueil': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [[0,"/"]],
    types: placeholder as Registry['accueil']['types'],
  },
  'players.store': {
    methods: ["POST"],
    pattern: '/joueur',
    tokens: [[0,"joueur"]],
    types: placeholder as Registry['players.store']['types'],
  },
  'grille': {
    methods: ["GET","HEAD"],
    pattern: '/grille',
    tokens: [[0,"grille"]],
    types: placeholder as Registry['grille']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
