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
  'players.reset': {
    methods: ["POST"],
    pattern: '/joueur/reset',
    tokens: [[0,"joueur"],[0,"reset"]],
    types: placeholder as Registry['players.reset']['types'],
  },
  'grille': {
    methods: ["GET","HEAD"],
    pattern: '/grille',
    tokens: [[0,"grille"]],
    types: placeholder as Registry['grille']['types'],
  },
  'final': {
    methods: ["GET","HEAD"],
    pattern: '/final',
    tokens: [[0,"final"]],
    types: placeholder as Registry['final']['types'],
  },
  'categories.show': {
    methods: ["GET","HEAD"],
    pattern: '/categorie/:id',
    tokens: [[0,"categorie"],[1,"id"]],
    types: placeholder as Registry['categories.show']['types'],
  },
  'categories.repondre': {
    methods: ["POST"],
    pattern: '/categorie/:id',
    tokens: [[0,"categorie"],[1,"id"]],
    types: placeholder as Registry['categories.repondre']['types'],
  },
  'triche.desactiver': {
    methods: ["GET","HEAD"],
    pattern: '/triche/off',
    tokens: [[0,"triche"],[0,"off"]],
    types: placeholder as Registry['triche.desactiver']['types'],
  },
  'triche.activer': {
    methods: ["GET","HEAD"],
    pattern: '/triche/:code',
    tokens: [[0,"triche"],[1,"code"]],
    types: placeholder as Registry['triche.activer']['types'],
  },
  'triche.passer': {
    methods: ["POST"],
    pattern: '/triche/passer/:id',
    tokens: [[0,"triche"],[0,"passer"],[1,"id"]],
    types: placeholder as Registry['triche.passer']['types'],
  },
  'triche.terminer': {
    methods: ["POST"],
    pattern: '/triche/terminer/:id',
    tokens: [[0,"triche"],[0,"terminer"],[1,"id"]],
    types: placeholder as Registry['triche.terminer']['types'],
  },
  'triche.tout': {
    methods: ["POST"],
    pattern: '/triche/tout',
    tokens: [[0,"triche"],[0,"tout"]],
    types: placeholder as Registry['triche.tout']['types'],
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
