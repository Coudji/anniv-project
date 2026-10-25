import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'accueil': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'accueil': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'accueil': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}