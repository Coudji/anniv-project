export type ThemeFront = {
  couleur: string
  icone: string
}

/**
 * Palette néon : chaque couleur a sa version vive, atténuée (cadres au repos),
 * son halo (cases allumées) et un fond teinté
 */
const PALETTE: Record<string, { vif: string; attenue: string; halo: string; fond: string }> = {
  cyan: {
    vif: '#3ee8f0',
    attenue: '#1f7f86',
    halo: 'rgba(62, 232, 240, 0.4)',
    fond: 'rgba(62, 232, 240, 0.12)',
  },
  magenta: {
    vif: '#ff4fb4',
    attenue: '#8c2d66',
    halo: 'rgba(255, 79, 180, 0.4)',
    fond: 'rgba(255, 79, 180, 0.12)',
  },
  jaune: {
    vif: '#ffd84a',
    attenue: '#8a7426',
    halo: 'rgba(255, 216, 74, 0.4)',
    fond: 'rgba(255, 216, 74, 0.1)',
  },
  vert: {
    vif: '#4dff9a',
    attenue: '#2a8a55',
    halo: 'rgba(77, 255, 154, 0.35)',
    fond: 'rgba(77, 255, 154, 0.1)',
  },
}

/**
 * Les variables CSS d'une couleur, à poser en `style` sur un élément :
 * tout ce qu'il contient prend alors cette couleur d'accent
 */
export function varsTheme(couleur: string) {
  const c = PALETTE[couleur] ?? PALETTE.cyan
  return {
    '--accent': c.vif,
    '--accent-attenue': c.attenue,
    '--accent-halo': c.halo,
    '--accent-fond': c.fond,
  }
}

/**
 * La police pixel n'a pas de majuscules accentuées : on retire les accents
 * des textes qu'on affiche en capitales avec elle (noms, pseudo)
 */
export function enPixel(texte: string) {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}
