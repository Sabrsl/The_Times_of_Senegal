export const PDF_REFERENCE_PATTERN = /^TOS-[A-F0-9]{8}-\d{8}-[A-F0-9]{4,7}$/i

/** Hash 32 bits simple (identique à l'algorithme d'origine). */
function hash32(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash = hash & hash // conversion en entier 32 bits
  }
  return hash
}

/**
 * Génère une référence unique de traçabilité pour le PDF
 * Format: TOS-{articleIdHash}-{timestamp}-{checksum}
 */
export function generatePDFReference(articleId: string, publishedAt?: string | null): string {
  const parsed = publishedAt ? new Date(publishedAt).getTime() : Date.now()
  // Une date invalide donnerait "NaN" et une référence au mauvais format
  const timestamp = Number.isFinite(parsed) ? parsed : 0

  const idPart = Math.abs(hash32(articleId)).toString(16).padStart(8, '0').toUpperCase()
  const datePart = String(timestamp).slice(-8).padStart(8, '0')
  const checksumPart = Math.abs(hash32(`${articleId}-${timestamp}`))
    .toString(16)
    .slice(0, 4)
    .padStart(4, '0')
    .toUpperCase()

  return `TOS-${idPart}-${datePart}-${checksumPart}`
}

/** Vérifie la validité d'une référence de traçabilité PDF. */
export function verifyPDFReference(
  reference: string,
  articleId: string,
  publishedAt?: string | null
): boolean {
  const parsed = publishedAt ? new Date(publishedAt).getTime() : Date.now()
  const timestamp = Number.isFinite(parsed) ? parsed : 0

  const idPart = Math.abs(hash32(articleId)).toString(16).padStart(8, '0').toUpperCase()
  const datePart = String(timestamp).slice(-8).padStart(8, '0')
  const fullChecksum = Math.abs(hash32(`${articleId}-${timestamp}`)).toString(16).toUpperCase()

  // Générer toutes les variantes possibles du checksum (4 à 7 caractères)
  const possibleChecksums = [
    fullChecksum.slice(0, 4).padStart(4, '0'),
    fullChecksum.slice(0, 5).padStart(5, '0'),
    fullChecksum.slice(0, 6).padStart(6, '0'),
    fullChecksum.slice(0, 7).padStart(7, '0'),
  ]

  const normalizedRef = reference.trim().toUpperCase()

  // Vérifier si la référence correspond à l'une des variantes
  for (const checksum of possibleChecksums) {
    const expected = `TOS-${idPart}-${datePart}-${checksum}`
    if (normalizedRef === expected) {
      return true
    }
  }

  return false
}

/**
 * Le hash ne peut pas être inversé pour retrouver l'ID de l'article :
 * il faut le chercher dans la base de données. Conservé pour compatibilité.
 */
export function extractArticleIdFromReference(reference: string): string | null {
  return PDF_REFERENCE_PATTERN.test(reference) ? null : null
}
