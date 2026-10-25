import type { HttpContext } from '@adonisjs/core/http'
import Player from '#models/player'
import { CATEGORY_IDS, loadContent, type CategoryId } from '#services/content'

// Ordre d'affichage dans la grille 3x3 : cat9 au centre
const ORDRE_GRILLE: CategoryId[] = [
  'cat1',
  'cat2',
  'cat3',
  'cat4',
  'cat9',
  'cat5',
  'cat6',
  'cat7',
  'cat8',
]

export default class GrilleController {
  async show({ session, response, inertia }: HttpContext) {
    const playerId = session.get('playerId')
    const player = playerId ? await Player.find(playerId) : null
    if (!player) {
      return response.redirect().toRoute('accueil')
    }

    const { categories } = await loadContent()

    const estTerminee = (id: CategoryId) => player[id] >= categories[id].questions.length
    const exterieuresTerminees = CATEGORY_IDS.filter((id) => id !== 'cat9').every(estTerminee)

    const cases = ORDRE_GRILLE.map((id) => ({
      id,
      nom: categories[id].nom,
      faites: player[id],
      total: categories[id].questions.length,
      terminee: estTerminee(id),
      verrouillee: id === 'cat9' && !exterieuresTerminees,
    }))

    return inertia.render('grille', { pseudo: player.pseudo, cases })
  }
}
