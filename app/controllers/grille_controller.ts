import type { HttpContext } from '@adonisjs/core/http'
import { loadContent, type CategoryId } from '#services/content'
import { centralDebloque, estTerminee, joueurEnSession } from '#services/progression'

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
    const player = await joueurEnSession(session)
    if (!player) {
      return response.redirect().toRoute('accueil')
    }

    const content = await loadContent()
    const debloque = centralDebloque(player, content)

    const cases = ORDRE_GRILLE.map((id) => ({
      id,
      nom: content.categories[id].nom,
      faites: player[id],
      total: content.categories[id].questions.length,
      terminee: estTerminee(player, id, content),
      verrouillee: id === 'cat9' && !debloque,
    }))

    return inertia.render('grille', { pseudo: player.pseudo, cases })
  }
}
