import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'accueil': { paramsTuple?: []; params?: {} }
    'players.store': { paramsTuple?: []; params?: {} }
    'grille': { paramsTuple?: []; params?: {} }
    'categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.repondre': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'accueil': { paramsTuple?: []; params?: {} }
    'grille': { paramsTuple?: []; params?: {} }
    'categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'accueil': { paramsTuple?: []; params?: {} }
    'grille': { paramsTuple?: []; params?: {} }
    'categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'players.store': { paramsTuple?: []; params?: {} }
    'categories.repondre': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}