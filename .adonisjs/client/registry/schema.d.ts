/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractRawResponse, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'accueil': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'players.store': {
    methods: ["POST"]
    pattern: '/joueur'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/player').pseudoValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/player').pseudoValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/players_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/players_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/players_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'players.reset': {
    methods: ["POST"]
    pattern: '/joueur/reset'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/players_controller').default['reset']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/players_controller').default['reset']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/players_controller').default['reset']>>>
    }
  }
  'grille': {
    methods: ["GET","HEAD"]
    pattern: '/grille'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/grille_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/grille_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/grille_controller').default['show']>>>
    }
  }
  'final': {
    methods: ["GET","HEAD"]
    pattern: '/final'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/final_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/final_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/final_controller').default['show']>>>
    }
  }
  'categories.show': {
    methods: ["GET","HEAD"]
    pattern: '/categorie/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/categories_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/categories_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/categories_controller').default['show']>>>
    }
  }
  'categories.repondre': {
    methods: ["POST"]
    pattern: '/categorie/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/categories_controller').default['repondre']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/categories_controller').default['repondre']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/categories_controller').default['repondre']>>>
    }
  }
  'triche.desactiver': {
    methods: ["GET","HEAD"]
    pattern: '/triche/off'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['desactiver']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['desactiver']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['desactiver']>>>
    }
  }
  'triche.activer': {
    methods: ["GET","HEAD"]
    pattern: '/triche/:code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['activer']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['activer']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['activer']>>>
    }
  }
  'triche.passer': {
    methods: ["POST"]
    pattern: '/triche/passer/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['passer']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['passer']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['passer']>>>
    }
  }
  'triche.terminer': {
    methods: ["POST"]
    pattern: '/triche/terminer/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['terminer']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['terminer']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['terminer']>>>
    }
  }
  'triche.tout': {
    methods: ["POST"]
    pattern: '/triche/tout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['tout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['tout']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/triche_controller').default['tout']>>>
    }
  }
}
