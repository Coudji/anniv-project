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
}
