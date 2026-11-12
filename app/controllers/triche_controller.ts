import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { CATEGORY_IDS, estCategorie, loadContent } from '#services/content'
import { joueurEnSession } from '#services/progression'
import { oublierSerie } from '#services/series'
import { oublierFiche } from '#services/fiches'
import { etatIntro, oublierIntro } from '#services/intros'
import { etatOmbre, oublierOmbre } from '#services/ombres'

/**
 * Mode triche, pour les tests et en cas de souci le jour J.
 * /triche/<code> l'active pour la session en cours (le code est dans .env),
 * /triche/off le désactive. Les actions ne marchent que mode triche activé.
 */
export default class TricheController {
  activer({ params, session, response }: HttpContext) {
    const code = env.get('TRICHE_CODE')
    if (code && params.code === code) {
      session.put('triche', true)
    }
    return response.redirect().toRoute('grille')
  }

  desactiver({ session, response }: HttpContext) {
    session.forget('triche')
    return response.redirect().toRoute('grille')
  }

  private async joueur({ session }: HttpContext) {
    if (session.get('triche') !== true) return null
    return joueurEnSession(session)
  }

  /**
   * Passe la question en cours d'une catégorie
   */
  async passer(ctx: HttpContext) {
    const player = await this.joueur(ctx)
    const id = ctx.params.id
    if (!player || !estCategorie(id)) {
      return ctx.response.redirect().toRoute('grille')
    }

    const { categories } = await loadContent()
    const total = categories[id].questions.length
    player[id] = Math.min(player[id] + 1, total)
    await player.save()
    oublierSerie(ctx.session)
    oublierFiche(ctx.session)
    oublierIntro(ctx.session)
    oublierOmbre(ctx.session)

    if (player[id] >= total) {
      return ctx.response.redirect().toRoute('grille')
    }
    return ctx.response.redirect().toRoute('categories.show', { id })
  }

  /**
   * Valide la question en cours comme une bonne réponse : l'écran de résultat
   * s'affiche (avec le "LE SAVAIS-TU ?" et ses médias), puis la question suivante
   */
  async valider(ctx: HttpContext) {
    const player = await this.joueur(ctx)
    const id = ctx.params.id
    if (!player || !estCategorie(id)) {
      return ctx.response.redirect().toRoute('grille')
    }

    const { categories } = await loadContent()
    const total = categories[id].questions.length
    if (player[id] >= total) {
      return ctx.response.redirect().toRoute('grille')
    }

    // Pour une intro, on montre la vidéo de l'intro en cours
    const question = categories[id].questions[player[id]]
    let intro: number | null = null
    if (question.type === 'intro') {
      const etat = await etatIntro(ctx.session, `${id}:${player[id]}`)
      intro = etat.intro
    }

    // Pour une ombre, on montre le Pokémon en cours
    let ombre: number | null = null
    if (question.type === 'ombre') {
      ombre = etatOmbre(ctx.session, `${id}:${player[id]}`, question).id
    }

    ctx.session.flash('resolue', { index: player[id], historique: null, intro, ombre })
    player[id] += 1
    await player.save()
    oublierSerie(ctx.session)
    oublierFiche(ctx.session)
    oublierIntro(ctx.session)
    oublierOmbre(ctx.session)

    ctx.session.flash('resultat', player[id] >= total ? 'terminee' : 'bonne')
    return ctx.response.redirect().toRoute('categories.show', { id })
  }

  /**
   * Termine une catégorie d'un coup
   */
  async terminer(ctx: HttpContext) {
    const player = await this.joueur(ctx)
    const id = ctx.params.id
    if (player && estCategorie(id)) {
      const { categories } = await loadContent()
      player[id] = categories[id].questions.length
      await player.save()
      oublierSerie(ctx.session)
      oublierFiche(ctx.session)
      oublierIntro(ctx.session)
      oublierOmbre(ctx.session)
    }
    return ctx.response.redirect().toRoute('grille')
  }

  /**
   * Termine toutes les catégories, ou toutes sauf le central (sauf=central)
   */
  async tout(ctx: HttpContext) {
    const player = await this.joueur(ctx)
    if (player) {
      const { categories } = await loadContent()
      const saufCentral = ctx.request.input('sauf') === 'central'
      for (const id of CATEGORY_IDS) {
        if (saufCentral && id === 'cat9') continue
        player[id] = categories[id].questions.length
      }
      await player.save()
      oublierSerie(ctx.session)
      oublierFiche(ctx.session)
      oublierIntro(ctx.session)
      oublierOmbre(ctx.session)
    }
    return ctx.response.redirect().toRoute('grille')
  }
}
