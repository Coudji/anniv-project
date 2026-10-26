import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'accueil': { paramsTuple?: []; params?: {} }
    'players.store': { paramsTuple?: []; params?: {} }
    'players.reset': { paramsTuple?: []; params?: {} }
    'grille': { paramsTuple?: []; params?: {} }
    'final': { paramsTuple?: []; params?: {} }
    'categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.repondre': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'triche.desactiver': { paramsTuple?: []; params?: {} }
    'triche.activer': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'triche.passer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'triche.terminer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'triche.tout': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'accueil': { paramsTuple?: []; params?: {} }
    'grille': { paramsTuple?: []; params?: {} }
    'final': { paramsTuple?: []; params?: {} }
    'categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'triche.desactiver': { paramsTuple?: []; params?: {} }
    'triche.activer': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
  HEAD: {
    'accueil': { paramsTuple?: []; params?: {} }
    'grille': { paramsTuple?: []; params?: {} }
    'final': { paramsTuple?: []; params?: {} }
    'categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'triche.desactiver': { paramsTuple?: []; params?: {} }
    'triche.activer': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
  POST: {
    'players.store': { paramsTuple?: []; params?: {} }
    'players.reset': { paramsTuple?: []; params?: {} }
    'categories.repondre': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'triche.passer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'triche.terminer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'triche.tout': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}