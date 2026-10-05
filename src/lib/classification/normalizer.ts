/**
 * Entity name normalization
 * Handles case, accents, spaces, punctuation for consistent comparison
 */

/**
 * Normalize entity name for comparison
 * Does NOT modify the canonical name stored in database
 */
export function normalizeEntityName(name: string): string {
  if (!name) return ''

  let normalized = name

  // Trim whitespace
  normalized = normalized.trim()

  // Remove multiple spaces
  normalized = normalized.replace(/\s+/g, ' ')

  // Remove leading/trailing punctuation
  normalized = normalized.replace(/^[^\w\s-]+/, '')
  normalized = normalized.replace(/[^\w\s-]+$/, '')

  // Remove dots after abbreviations (BCEAO. -> BCEAO)
  normalized = normalized.replace(/\.(?=\s|$)/g, '')

  // Normalize apostrophes
  normalized = normalized.replace(/[`´']/g, "'")

  return normalized.toLowerCase()
}

/**
 * Normalize with accent removal for fuzzy matching
 */
export function normalizeEntityNameStrict(name: string): string {
  if (!name) return ''

  let normalized = normalizeEntityName(name)

  // Remove accents
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  return normalized
}

/**
 * Check if two names are equivalent after normalization
 */
export function areNamesEquivalent(name1: string, name2: string): boolean {
  const norm1 = normalizeEntityNameStrict(name1)
  const norm2 = normalizeEntityNameStrict(name2)
  return norm1 === norm2
}
