import type { HttpContext } from '@adonisjs/core/http'
import { CATEGORY_IDS, loadContent, type CategoryId } from '#services/content'
import { centralDebloque, estTerminee, joueurEnSession } from '#services/progression'
import { questionPourFront, verifierReponse, type Verification } from '#services/mecaniques'

type Resultat = 'bonne' | 'terminee'

function estCategorie(id: string): id is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(id)
}

export default class CategoriesController {
  /**
   * Charge le joueur et la catégorie, ou null si l'accès n'est pas permis :
   * pas de joueur, catégorie inconnue ou central verrouillé
   */
  private async charger({ params, session }: HttpContext) {
    const player = await joueurEnSession(session)
    if (!player || !estCategorie(params.id)) return null

    const id = params.id
    const content = await loadContent()

    if (id === 'cat9' && !centralDebloque(player, content)) return null

    return { player, id, content, categorie: content.categories[id] }
  }

  async show(ctx: HttpContext) {
    const etat = await this.charger(ctx)
    if (!etat) {
      return ctx.response.redirect().toRoute('grille')
    }

    const { player, id, content, categorie } = etat
    const resultat = (ctx.session.flashMessages.get('resultat') as Resultat | undefined) ?? null

    if (estTerminee(player, id, content)) {
      // Catégorie terminée : on n'affiche la page que juste après la dernière bonne réponse
      if (resultat !== 'terminee') {
        return ctx.response.redirect().toRoute('grille')
      }

      return ctx.inertia.render('categorie', {
        id,
        nom: categorie.nom,
        numero: categorie.questions.length,
        total: categorie.questions.length,
        question: null,
        resultat,
        retour: null,
      })
    }

    return ctx.inertia.render('categorie', {
      id,
      nom: categorie.nom,
      numero: player[id] + 1,
      total: categorie.questions.length,
      question: questionPourFront(categorie.questions[player[id]]),
      resultat,
      retour: (ctx.session.flashMessages.get('retour') as Verification['retour']) ?? null,
    })
  }

  async repondre(ctx: HttpContext) {
    const etat = await this.charger(ctx)
    if (!etat || estTerminee(etat.player, etat.id, etat.content)) {
      return ctx.response.redirect().toRoute('grille')
    }

    const { player, id, content, categorie } = etat
    const question = categorie.questions[player[id]]
    const verification = verifierReponse(question, ctx.request.input('reponse', ''))

    if (!verification.correct) {
      ctx.session.flash('error', 'Mauvaise réponse')
      if (verification.retour) {
        ctx.session.flash('retour', verification.retour)
      }
      return ctx.response.redirect().toRoute('categories.show', { id })
    }

    player[id] += 1
    await player.save()

    const resultat: Resultat = estTerminee(player, id, content) ? 'terminee' : 'bonne'
    ctx.session.flash('resultat', resultat)

    return ctx.response.redirect().toRoute('categories.show', { id })
  }
}
