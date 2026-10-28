import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import type { Session } from '@adonisjs/session'

type Intro = { jeu: string; audio: string; video: string; duree: number }

/**
 * État de la question en cours, gardé dans la session : l'intro à trouver.
 * `cle` identifie la question (catégorie + numéro) : si elle change, on en tire une nouvelle.
 */
type EtatIntro = { cle: string; intro: number }

const CLE_SESSION = 'intro'

let intros: Intro[] | null = null

async function chargerIntros() {
  if (!intros) {
    const raw = await readFile(app.makePath('content/intros.json'), 'utf-8')
    intros = (JSON.parse(raw) as { intros: Intro[] }).intros
  }
  return intros
}

/**
 * Tire une intro au hasard, différente de la précédente
 */
async function tirerIntro(precedente?: number) {
  const liste = await chargerIntros()
  let intro = Math.floor(Math.random() * liste.length)
  while (intro === precedente) {
    intro = Math.floor(Math.random() * liste.length)
  }
  return intro
}

/**
 * Récupère l'intro en cours pour cette question, ou en tire une nouvelle
 */
export async function etatIntro(session: Session, cle: string): Promise<EtatIntro> {
  const etat = session.get(CLE_SESSION) as EtatIntro | undefined
  if (etat?.cle === cle) return etat

  const nouvel: EtatIntro = { cle, intro: await tirerIntro() }
  session.put(CLE_SESSION, nouvel)
  return nouvel
}

/**
 * Vérifie le jeu choisi. Juste : la question est finie, on renvoie l'intro trouvée
 * (pour montrer sa vidéo). Faux : nouvelle intro. `correct` est null si rien n'a été choisi.
 */
export async function repondreIntro(
  session: Session,
  cle: string,
  reponse: unknown
): Promise<{ correct: boolean | null; trouvee: number | null }> {
  const etat = await etatIntro(session, cle)
  if (typeof reponse !== 'string' || !reponse) return { correct: null, trouvee: null }

  const liste = await chargerIntros()
  if (reponse === liste[etat.intro].jeu) {
    session.forget(CLE_SESSION)
    return { correct: true, trouvee: etat.intro }
  }

  session.put(CLE_SESSION, { cle, intro: await tirerIntro(etat.intro) })
  return { correct: false, trouvee: null }
}

/**
 * Abandonne la question en cours (en revenant à la grille, par exemple)
 */
export function oublierIntro(session: Session) {
  session.forget(CLE_SESSION)
}

/**
 * Ce que le front affiche : la musique à reconnaître et la liste des jeux (dans l'ordre de
 * sortie). Le nom du fichier ne dit rien du jeu.
 */
export async function introPourFront(etat: EtatIntro) {
  const liste = await chargerIntros()
  return {
    audio: `/medias/${liste[etat.intro].audio}`,
    jeux: liste.map((i) => i.jeu),
  }
}

/**
 * La vidéo de l'intro trouvée, pour l'écran de résultat
 */
export async function videoIntro(index: number) {
  const liste = await chargerIntros()
  const intro = liste[index]
  if (!intro) return null
  return { type: 'video' as const, url: `/medias/${intro.video}`, debut: 0, fin: null, bips: [] }
}
