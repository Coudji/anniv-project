import { writeFile } from 'node:fs/promises'
import { BaseCommand } from '@adonisjs/core/ace'

// Données publiées par PokéAPI sur GitHub
const SOURCE = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv'
const FRANCAIS = '5'

/**
 * Lecture CSV minimale : les colonnes utilisées ne contiennent ni virgule ni guillemet
 */
function lireCsv(texte: string) {
  const [entete, ...lignes] = texte.trim().split(/\r?\n/)
  const colonnes = entete.split(',')

  return lignes.map((ligne) => {
    const valeurs = ligne.split(',')
    return Object.fromEntries(colonnes.map((colonne, i) => [colonne, valeurs[i]]))
  })
}

async function telecharger(fichier: string) {
  const reponse = await fetch(`${SOURCE}/${fichier}`)
  if (!reponse.ok) throw new Error(`${fichier} : HTTP ${reponse.status}`)
  return lireCsv(await reponse.text())
}

export default class ImportPokemon extends BaseCommand {
  static commandName = 'pokemon:import'
  static description =
    'Télécharge les Pokémon (nom français, poids, taille) dans content/pokemon.json'

  async run() {
    const pokemon = await telecharger('pokemon.csv')
    const noms = await telecharger('pokemon_species_names.csv')

    const nomsFrancais = new Map(
      noms
        .filter((n) => n.local_language_id === FRANCAIS)
        .map((n) => [n.pokemon_species_id, n.name])
    )

    // Une seule forme par espèce : la forme par défaut
    const liste = pokemon
      .filter((p) => p.is_default === '1' && nomsFrancais.has(p.species_id))
      .map((p) => ({
        id: Number(p.species_id),
        nom: nomsFrancais.get(p.species_id)!,
        poids: Number(p.weight), // en hectogrammes
        taille: Number(p.height), // en décimètres
      }))
      .sort((a, b) => a.id - b.id)

    await writeFile(this.app.makePath('content/pokemon.json'), JSON.stringify(liste))
    this.logger.success(`${liste.length} Pokémon enregistrés dans content/pokemon.json`)
  }
}
