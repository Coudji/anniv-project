import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'accueil': { paramsTuple?: []; params?: {} }
    'players.store': { paramsTuple?: []; params?: {} }
    'grille': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'accueil': { paramsTuple?: []; params?: {} }
    'grille': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'accueil': { paramsTuple?: []; params?: {} }
    'grille': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'players.store': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}