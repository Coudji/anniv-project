import type { HttpContext } from '@adonisjs/core/http'
import { loadContent, themeDe } from '#services/content'
import { ORDRE_GRILLE, jeuTermine, joueurEnSession } from '#services/progression'

export default class FinalController {
  async show({ session, response, inertia }: HttpContext) {
    const player = await joueurEnSession(session)
    if (!player) {
      return response.redirect().toRoute('accueil')
    }

    const content = await loadContent()
    if (!jeuTermine(player, content)) {
      return response.redirect().toRoute('grille')
    }

    // Les 9 cases, pour l'animation de départ (la grille qui se transforme en puzzle)
    const cases = ORDRE_GRILLE.map((id) => ({
      id,
      nom: content.categories[id].nom,
      theme: themeDe(content.categories[id]),
    }))

    return inertia.render('final', {
      cases,
      dos: '/carte/dos.webp',
      face: '/carte/face.webp',
    })
  }
}
