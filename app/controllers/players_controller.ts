import type { HttpContext } from '@adonisjs/core/http'
import Player from '#models/player'
import { pseudoValidator } from '#validators/player'

export default class PlayersController {
  async store({ request, session, response }: HttpContext) {
    const { pseudo } = await request.validateUsing(pseudoValidator)

    const player = await Player.firstOrCreate({ pseudo })
    session.put('playerId', player.id)

    return response.redirect().toRoute('grille')
  }
}
