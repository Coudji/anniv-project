import type { HttpContext } from '@adonisjs/core/http'
import { estCategorie, loadContent, themeDe, type Category } from '#services/content'
import { centralDebloque, estTerminee, joueurEnSession } from '#services/progression'
import {
  apresPourFront,
  questionPourFront,
  verifierReponse,
  type Verification,
} from '#services/mecaniques'
import {
  etatSerie,
  historiquePourFront,
  repondreSerie,
  seriePourFront,
  type HistoriqueSerie,
} from '#services/series'
import type { Question } from '#services/content'

type Resultat = 'bonne' | 'terminee'

/**
 * Ce qui est gardé en session après une bonne réponse, pour l'écran de résultat :
 * la position de la question résolue, et l'historique final pour une série.
 * Le reste est reconstruit depuis le JSON (la session vit dans un cookie de taille limitée).
 */
type Resolue = { index: number; historique: HistoriqueSerie | null }

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

  /**
   * La question telle que le front la voit, avec l'état de la série si c'en est une
   */
  private async questionPourFront({ session }: HttpContext, question: Question, cle: string) {
    if (question.type !== 'serie') return questionPourFront(question)

    const etat = await etatSerie(session, cle)
    return { ...questionPourFront(question), serie: await seriePourFront(etat, question) }
  }

  /**
   * L'écran de résultat : la question résolue, le tableau final d'une série,
   * et le contenu complémentaire
   */
  private async resoluePourFront({ session }: HttpContext, categorie: Category) {
    const resolue = session.flashMessages.get('resolue') as Resolue | undefined
    const question = resolue ? categorie.questions[resolue.index] : undefined
    if (!resolue || !question) return null

    return {
      question: question.question,
      media: questionPourFront(question).media,
      serie:
        question.type === 'serie' && resolue.historique
          ? await historiquePourFront(resolue.historique, question)
          : null,
      apres: apresPourFront(question.apres),
    }
  }

  async show(ctx: HttpContext) {
    const etat = await this.charger(ctx)
    if (!etat) {
      return ctx.response.redirect().toRoute('grille')
    }

    const { player, id, content, categorie } = etat
    const resultat = (ctx.session.flashMessages.get('resultat') as Resultat | undefined) ?? null
    const resolue = await this.resoluePourFront(ctx, categorie)

    if (estTerminee(player, id, content)) {
      // Catégorie terminée : on n'affiche la page que juste après la dernière bonne réponse
      if (resultat !== 'terminee') {
        return ctx.response.redirect().toRoute('grille')
      }

      return ctx.inertia.render('categorie', {
        id,
        nom: categorie.nom,
        theme: themeDe(categorie),
        numero: categorie.questions.length,
        total: categorie.questions.length,
        question: null,
        resultat,
        retour: null,
        resolue,
      })
    }

    const question = categorie.questions[player[id]]

    return ctx.inertia.render('categorie', {
      id,
      nom: categorie.nom,
      theme: themeDe(categorie),
      numero: player[id] + 1,
      total: categorie.questions.length,
      question: await this.questionPourFront(ctx, question, `${id}:${player[id]}`),
      resultat,
      retour: (ctx.session.flashMessages.get('retour') as Verification['retour']) ?? null,
      resolue,
    })
  }

  async repondre(ctx: HttpContext) {
    const etat = await this.charger(ctx)
    if (!etat || estTerminee(etat.player, etat.id, etat.content)) {
      return ctx.response.redirect().toRoute('grille')
    }

    const { player, id, content, categorie } = etat
    const question = categorie.questions[player[id]]
    const reponse = ctx.request.input('reponse', '')
    let historique: HistoriqueSerie | null = null

    if (question.type === 'serie') {
      // Série : la question n'est validée qu'une fois l'objectif atteint
      historique = await repondreSerie(ctx.session, `${id}:${player[id]}`, question, reponse)
      if (!historique) {
        return ctx.response.redirect().toRoute('categories.show', { id })
      }
    } else {
      const verification = verifierReponse(question, reponse)

      if (!verification.correct) {
        ctx.session.flash('error', 'Mauvaise réponse')
        if (verification.retour) {
          ctx.session.flash('retour', verification.retour)
        }
        return ctx.response.redirect().toRoute('categories.show', { id })
      }
    }

    const resolue: Resolue = { index: player[id], historique }
    ctx.session.flash('resolue', resolue)

    player[id] += 1
    await player.save()

    const resultat: Resultat = estTerminee(player, id, content) ? 'terminee' : 'bonne'
    ctx.session.flash('resultat', resultat)

    return ctx.response.redirect().toRoute('categories.show', { id })
  }
}
