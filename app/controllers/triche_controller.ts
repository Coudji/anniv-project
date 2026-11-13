import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { CATEGORY_IDS, estCategorie, loadContent } from '#services/content'
import { joueurEnSession } from '#services/progression'
import { oublierSerie } from '#services/series'
import { oublierFiche } from '#services/fiches'
import { etatIntro, oublierIntro } from '#services/intros'
import { etatOmbre, oublierOmbre } from '#services/ombres'
import type { Question } from '#services/content'

/**
 * La bonne réponse en toutes lettres : la réponse affichée au résultat si elle existe,
 * sinon la première réponse acceptée ou la (les) bonne(s) option(s)
 */
function reponseEnClair(question: Question) {
  if (question.apres?.reponse) return question.apres.reponse
  switch (question.type) {
    case 'texte':
      return question.reponses[0]
    case 'choix': {
      const bonnes = Array.isArray(question.bonne) ? question.bonne : [question.bonne]
      return bonnes
        .map((i) => {
          const option = question.options[i]
          return 'texte' in option ? option.texte : `image n° ${i + 1}`
        })
        .join(' + ')
    }
    case 'liste':
      return question.elements.map((element) => element.reponses[0]).join(', ')
    default:
      return '—'
  }
}

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

  /**
   * Les réponses de la catégorie centrale, à imprimer et découper pour les enveloppes
   * (mode triche uniquement). Toujours à jour avec jeu.json.
   */
  async enveloppes({ session, inertia, response }: HttpContext) {
    if (session.get('triche') !== true) return response.redirect().toRoute('grille')

    const { categories } = await loadContent()
    const cartes = categories.cat9.questions.map((question, index) => {
      const morceaux = question.question.match(/^(Question d(?:e |').+?)\s?:\s*(.*)$/)
      const texte = morceaux ? morceaux[2] : question.question
      return {
        numero: index + 1,
        titre: morceaux ? morceaux[1] : 'Question',
        question: texte.charAt(0).toUpperCase() + texte.slice(1),
        reponse: reponseEnClair(question),
      }
    })
    return inertia.render('enveloppes', { cartes })
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
