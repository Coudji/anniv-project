import Player from '#models/player'
import type { Session } from '@adonisjs/session'
import { CATEGORY_IDS, type CategoryId, type Content } from '#services/content'

export async function joueurEnSession(session: Session) {
  const playerId = session.get('playerId')
  return playerId ? await Player.find(playerId) : null
}

export function estTerminee(player: Player, id: CategoryId, content: Content) {
  return player[id] >= content.categories[id].questions.length
}

export function centralDebloque(player: Player, content: Content) {
  return CATEGORY_IDS.filter((id) => id !== 'cat9').every((id) => estTerminee(player, id, content))
}
