import type { HttpContext } from '@adonisjs/core/http'
import Player from '#models/player'
import { pseudoValidator } from '#validators/player'
import { CATEGORY_IDS } from '#services/content'
import { joueurEnSession } from '#services/progression'

export default class PlayersController {
  async store({ request, session, response }: HttpContext) {
    const { pseudo } = await request.validateUsing(pseudoValidator)

    const player = await Player.firstOrCreate({ pseudo })
    session.put('playerId', player.id)

    return response.redirect().toRoute('grille')
  }

  async reset({ session, response }: HttpContext) {
    const player = await joueurEnSession(session)

    if (player) {
      for (const id of CATEGORY_IDS) {
        player[id] = 0
      }
      await player.save()
    }

    return response.redirect().toRoute('grille')
  }
}
