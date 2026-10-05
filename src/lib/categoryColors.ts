/**
 * Configuration des couleurs par catégorie
 * Utilisé pour les badges, backgrounds et indicateurs visuels
 */

export interface CategoryColorConfig {
  primary: string    // Couleur principale (badge, texte)
  light: string      // Version claire (background)
  gradient: string   // Gradient pour les affiches
}

export const CATEGORY_COLORS: Record<string, CategoryColorConfig> = {
  'actualites': {
    primary: '#2563eb',
    light: '#dbeafe',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
  },
  'politique': {
    primary: '#dc2626',
    light: '#fee2e2',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
  },
  'economie': {
    primary: '#059669',
    light: '#d1fae5',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
  },
  'societe': {
    primary: '#7c3aed',
    light: '#ede9fe',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
  },
  'culture': {
    primary: '#db2777',
    light: '#fce7f3',
    gradient: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)'
  },
  'sport': {
    primary: '#ea580c',
    light: '#ffedd5',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
  },
  'monde': {
    primary: '#0891b2',
    light: '#cffafe',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
  },
  'comprendre': {
    primary: '#4b5563',
    light: '#f3f4f6',
    gradient: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
  },
  'verifie': {
    primary: '#16a34a',
    light: '#dcfce7',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
  },
  // Fallback pour les catégories non définies
  'default': {
    primary: '#6b7280',
    light: '#f3f4f6',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  }
}

/**
 * Récupère la configuration de couleur pour une catégorie
 * @param slug - Le slug de la catégorie
 * @returns La configuration de couleur
 */
export function getCategoryColor(slug: string | null | undefined): CategoryColorConfig {
  if (!slug) return CATEGORY_COLORS.default
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '')
  return CATEGORY_COLORS[normalizedSlug] || CATEGORY_COLORS.default
}

/**
 * Récupère la couleur principale pour une catégorie
 * @param slug - Le slug de la catégorie
 * @returns La couleur principale en hex
 */
export function getCategoryPrimaryColor(slug: string | null | undefined): string {
  return getCategoryColor(slug).primary
}

/**
 * Récupère la couleur claire pour une catégorie
 * @param slug - Le slug de la catégorie
 * @returns La couleur claire en hex
 */
export function getCategoryLightColor(slug: string | null | undefined): string {
  return getCategoryColor(slug).light
}

/**
 * Récupère le gradient pour une catégorie
 * @param slug - Le slug de la catégorie
 * @returns Le gradient CSS
 */
export function getCategoryGradient(slug: string | null | undefined): string {
  return getCategoryColor(slug).gradient
}
