/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  accueil: typeof routes['accueil']
  players: {
    store: typeof routes['players.store']
    reset: typeof routes['players.reset']
  }
  grille: typeof routes['grille']
  final: typeof routes['final']
  categories: {
    show: typeof routes['categories.show']
    repondre: typeof routes['categories.repondre']
  }
  triche: {
    desactiver: typeof routes['triche.desactiver']
    activer: typeof routes['triche.activer']
    passer: typeof routes['triche.passer']
    terminer: typeof routes['triche.terminer']
    tout: typeof routes['triche.tout']
  }
}
