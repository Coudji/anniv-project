import type { HttpContext } from '@adonisjs/core/http'
import { loadContent, themeDe } from '#services/content'
import {
  ORDRE_GRILLE,
  centralDebloque,
  estTerminee,
  jeuTermine,
  joueurEnSession,
} from '#services/progression'
import { oublierSerie } from '#services/series'
import { oublierFiche } from '#services/fiches'
import { oublierIntro } from '#services/intros'

export default class GrilleController {
  async show({ session, response, inertia }: HttpContext) {
    const player = await joueurEnSession(session)
    if (!player) {
      return response.redirect().toRoute('accueil')
    }

    // Revenir à la grille abandonne la série en cours
    oublierSerie(session)
    oublierFiche(session)
    oublierIntro(session)

    const content = await loadContent()

    // Tout est terminé : place au grand final
    if (jeuTermine(player, content)) {
      return response.redirect().toRoute('final')
    }

    const debloque = centralDebloque(player, content)

    const cases = ORDRE_GRILLE.map((id) => ({
      id,
      nom: content.categories[id].nom,
      theme: themeDe(content.categories[id]),
      faites: player[id],
      total: content.categories[id].questions.length,
      terminee: estTerminee(player, id, content),
      verrouillee: id === 'cat9' && !debloque,
    }))

    return inertia.render('grille', { pseudo: player.pseudo, cases })
  }
}
