/**
 * Termes génériques qui ne doivent PAS être traités comme des entités.
 * Ils sont filtrés lors de l'extraction pour éviter les faux positifs.
 *
 * ⚠️ Règle d'or : n'ajouter que des mots qui ne forment JAMAIS, seuls ou
 * combinés entre eux, le nom complet d'une vraie entité.
 *   - OK  : « ministre », « gouvernement », « mairie » (fonctions, lieux communs)
 *   - NON : « santé », « nationale », « assemblée », « conseil »…
 *     (« Ministère de la Santé » ou « Assemblée nationale » seraient filtrés
 *     à tort, car chaque mot serait générique)
 * Les noms propres (Dakar, Sénégal, Thiès…) n'ont rien à faire ici.
 */

/* -------------------------------------------------------------------------- */
/*  Catégories                                                                */
/* -------------------------------------------------------------------------- */

export const GENERIC_TERM_CATEGORIES = {
  /** Titres, fonctions et civilités */
  titles: [
    'président',
    'présidente',
    'vice-président',
    'vice-présidente',
    'premier ministre',
    'ministre',
    'ministres',
    'ministère',
    'secrétaire',
    'secrétaire général',
    'secrétaire générale',
    'directeur',
    'directrice',
    'directeur général',
    'directrice générale',
    'chef',
    'chef de l\'état',
    'porte-parole',
    'maire',
    'adjoint',
    'préfet',
    'sous-préfet',
    'gouverneur',
    'député',
    'députée',
    'sénateur',
    'sénatrice',
    'conseiller',
    'conseillère',
    'ambassadeur',
    'ambassadrice',
    'consul',
    'juge',
    'magistrat',
    'procureur',
    'avocat',
    'commissaire',
    'inspecteur',
    'colonel',
    'capitaine',
    'lieutenant',
    'général',
    'ministre d\'état',
    'responsable',
    'responsables',
    'dirigeant',
    'dirigeants',
    'porte parole',
    'représentant',
    'représentante',
    'délégué',
    'déléguée',
    'coordonnateur',
    'coordonnatrice',
    'président de la république',
    'imam',
    'khalife',
    'marabout',
    'chef de village',
    'monsieur',
    'madame',
    'mademoiselle',
    'mme',
    'docteur',
    'dr',
    'professeur',
    'maître',
    'excellence',
    'honorable',
  ],

  /** Pouvoirs publics et institutions génériques */
  institutions: [
    'état',
    'états',
    'gouvernement',
    'autorités',
    'pouvoir public',
    'pouvoirs publics',
    'administration',
    'administrations',
    'services',
    'service public',
    'services publics',
    'organismes',
    'institutions',
    'collectivité',
    'collectivités',
    'mairie',
    'préfecture',
    'municipalité',
    'tribunal',
    'tribunaux',
    'justice',
    'parquet',
    'police',
    'gendarmerie',
    'armée',
    'forces de l\'ordre',
    'parlement',
    'opposition',
    'majorité',
    'coalition',
    'parti',
    'partis',
    'syndicat',
    'syndicats',
    'association',
    'associations',
    'organisation',
    'organisations',
    'ong',
    'entreprise',
    'entreprises',
    'société',
    'sociétés',
    'compagnie',
    'groupe',
    'médias',
    'presse',
    'délégation',
    'comité',
    'commission',
  ],

  /** Géographie générique */
  geography: [
    'capitale',
    'ville',
    'villes',
    'village',
    'villages',
    'pays',
    'région',
    'régions',
    'département',
    'départements',
    'arrondissement',
    'quartier',
    'quartiers',
    'commune',
    'communes',
    'district',
    'localité',
    'localités',
    'agglomération',
    'banlieue',
    'province',
    'territoire',
    'territoires',
    'continent',
    'île',
    'littoral',
    'frontière',
    'frontières',
    'rue',
    'avenue',
    'boulevard',
    'route',
    'place',
    'marché',
    'gare',
    'aéroport',
    'hôpital',
    'école',
    'université',
    'stade',
    'site',
    'zone',
    'zones',
    'secteur',
    'secteurs',
    'milieu',
    'périphérie',
  ],

  /** Points cardinaux et positions */
  directions: [
    'centre',
    'centre-ville',
    'nord',
    'sud',
    'est',
    'ouest',
    'nord-est',
    'nord-ouest',
    'sud-est',
    'sud-ouest',
    'intérieur',
    'extérieur',
  ],

  /** Population et groupes de personnes */
  demographics: [
    'population',
    'populations',
    'habitants',
    'habitant',
    'citoyens',
    'citoyennes',
    'citoyen',
    'résidents',
    'riverains',
    'ménages',
    'familles',
    'famille',
    'jeunes',
    'femmes',
    'hommes',
    'enfants',
    'élèves',
    'étudiants',
    'enseignants',
    'travailleurs',
    'agriculteurs',
    'commerçants',
    'victimes',
    'témoins',
    'manifestants',
    'militants',
    'électeurs',
    'sénégalais',
    'sénégalaise',
    'sénégalaises',
    'dakarois',
    'dakaroise',
    'africains',
    'africaine',
    'français',
    'française',
    'étrangers',
    'ressortissants',
    'personnes',
    'individus',
    'suspects',
    'public',
    'communauté',
    'communautés',
  ],

  /** Événements et actions génériques */
  events: [
    'réunion',
    'réunions',
    'rencontre',
    'rencontres',
    'conférence',
    'conférence de presse',
    'sommet',
    'élection',
    'élections',
    'scrutin',
    'vote',
    'consultation',
    'campagne',
    'séance',
    'session',
    'audience',
    'procès',
    'cérémonie',
    'manifestation',
    'marche',
    'grève',
    'visite',
    'discours',
    'déclaration',
    'communiqué',
    'annonce',
    'décision',
    'débat',
    'atelier',
    'séminaire',
    'forum',
    'festival',
    'projet',
    'projets',
    'programme',
    'réforme',
    'loi',
    'décret',
    'arrêté',
    'rapport',
    'enquête',
    'accord',
    'incident',
    'accident',
    'situation',
    'mesure',
    'mesures',
  ],

  /** Repères temporels (jamais des entités) */
  time: [
    'aujourd\'hui',
    'hier',
    'demain',
    'cette semaine',
    'semaine',
    'mois',
    'année',
    'années',
    'jour',
    'jours',
    'matin',
    'soir',
    'nuit',
    'week-end',
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
    'dimanche',
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
} as const

/* -------------------------------------------------------------------------- */
/*  Ensemble public (compatible avec l'ancien export)                         */
/* -------------------------------------------------------------------------- */

export const GENERIC_TERMS: Set<string> = new Set(
  Object.values(GENERIC_TERM_CATEGORIES).flat()
)

/* -------------------------------------------------------------------------- */
/*  Normalisation                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Mots outils ignorés lors de la comparaison (articles, prépositions…),
 * sans accents.
 */
const STOP_WORDS = new Set([
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd',
  'au', 'aux', 'et', 'ou', 'en', 'a', 'dans', 'sur', 'pour', 'par',
  'avec', 'sans', 'sous', 'entre', 'ce', 'cet', 'cette', 'ces',
  'son', 'sa', 'ses', 'leur', 'leurs', 'notre', 'nos', 'votre', 'vos',
])

/** Minuscules, sans accents, apostrophes uniformisées, espaces nettoyés. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`]/g, "'")
    .replace(/œ/g, 'oe')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Version normalisée de GENERIC_TERMS, calculée une seule fois.
 * Les entrées passent par le même traitement que le texte analysé
 * (« chef de l'État » → « chef etat »), ce qui garantit la correspondance.
 */
const NORMALIZED_TERMS = new Set(
  Array.from(GENERIC_TERMS, (term) => tokenize(term).join(' ')).filter(Boolean)
)

/**
 * Découpe un texte en mots significatifs :
 * ponctuation retirée, élisions (l', d', qu'…) retirées, mots outils exclus.
 */
function tokenize(value: string): string[] {
  return normalize(value)
    .split(' ')
    .map((token) =>
      token
        .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
        .replace(/^(?:l|d|j|n|s|c|m|t|qu)'/, '')
    )
    .filter((token) => token && !STOP_WORDS.has(token))
}

/** Vrai si le terme (déjà normalisé) est connu, au singulier ou au pluriel. */
function isKnown(candidate: string): boolean {
  if (NORMALIZED_TERMS.has(candidate)) return true
  return /[sx]$/.test(candidate) && NORMALIZED_TERMS.has(candidate.slice(0, -1))
}

/* -------------------------------------------------------------------------- */
/*  API publique                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Vérifie si un terme est générique et doit être filtré.
 * Insensible à la casse, aux accents, au pluriel et aux articles :
 * « Le Gouvernement », « ministres », « Sénégalais » → true.
 */
export function isGenericTerm(term: string): boolean {
  const tokens = tokenize(term)
  if (tokens.length === 0) return false
  return isKnown(tokens.join(' '))
}

/**
 * Vérifie si une expression ne contient QUE des termes génériques.
 * Reconnaît aussi les expressions de plusieurs mots (« premier ministre »)
 * et ignore les articles : « le chef de l'État » → true,
 * « Ministre Macky Sall » → false.
 */
export function isPhraseGeneric(phrase: string): boolean {
  const tokens = tokenize(phrase)

  // Uniquement des mots outils (« le », « de la ») : rien à extraire
  if (tokens.length === 0) return phrase.trim().length > 0

  // Parcours glouton : on essaie d'abord les expressions les plus longues
  let i = 0
  while (i < tokens.length) {
    let matched = false
    for (let size = Math.min(3, tokens.length - i); size >= 1; size--) {
      if (isKnown(tokens.slice(i, i + size).join(' '))) {
        i += size
        matched = true
        break
      }
    }
    if (!matched) return false
  }
  return true
}

/**
 * Retire d'une liste tous les termes ou expressions entièrement génériques.
 */
export function filterGenericTerms<T extends string>(terms: readonly T[]): T[] {
  return terms.filter((term) => !isPhraseGeneric(term))
}