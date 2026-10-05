import Link from 'next/link'
import type { ReactNode } from 'react'

export type BentoSize = 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'full'

export interface BentoItem {
  id: string
  size: BentoSize
  content: ReactNode
  href?: string
  onClick?: () => void
  className?: string
}

interface BentoGridProps {
  items: BentoItem[]
  className?: string
}

/**
 * Mobile first : 2 colonnes sur téléphone, 4 dès `md` (tablette et plus).
 * Chaque taille ne dépasse jamais le nombre de colonnes disponible,
 * sinon le navigateur crée des colonnes fantômes et la grille déborde.
 *
 * Mobile (2 col) : small = demi-largeur, tall = demi-largeur sur 2 lignes,
 *                  medium / large / wide / full = pleine largeur.
 * Tablette+ (4 col) : tailles d'origine (wide et full sur 3 colonnes).
 */
const sizeClasses: Record<BentoSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-2',
  large: 'col-span-2 md:row-span-2',
  wide: 'col-span-2 md:col-span-3',
  tall: 'col-span-1 row-span-2',
  full: 'col-span-2 md:col-span-3 md:row-span-2',
}

const GRID_CLASSES =
  'grid grid-cols-2 auto-rows-[minmax(150px,auto)] grid-flow-dense gap-3 md:grid-cols-4 md:auto-rows-[minmax(180px,auto)] md:gap-4 lg:auto-rows-[minmax(200px,auto)]'

const CARD_CLASSES =
  'relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] text-left shadow-sm transition-all duration-300 ease-out hover:border-[var(--border-strong)] hover:shadow-md motion-reduce:transition-none'

const INTERACTIVE_CLASSES =
  'cursor-pointer motion-safe:hover:-translate-y-0.5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-strong)]'

/** URL absolue ou protocole (https:, mailto:, tel:...) : lien classique plutôt que <Link>. */
const EXTERNAL_URL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i

export function BentoGrid({ items, className = '' }: BentoGridProps) {
  return (
    <div className={[GRID_CLASSES, className].filter(Boolean).join(' ')}>
      {items.map((item) => {
        const sizeClass = sizeClasses[item.size] ?? sizeClasses.small
        const interactive = Boolean(item.href || item.onClick)
        const classes = [
          sizeClass,
          CARD_CLASSES,
          interactive ? INTERACTIVE_CLASSES : '',
          item.className ?? '',
        ]
          .filter(Boolean)
          .join(' ')

        if (item.href) {
          return EXTERNAL_URL.test(item.href) ? (
            <a key={item.id} href={item.href} onClick={item.onClick} className={classes}>
              {item.content}
            </a>
          ) : (
            <Link key={item.id} href={item.href} onClick={item.onClick} className={classes}>
              {item.content}
            </Link>
          )
        }

        if (item.onClick) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`${classes} w-full`}
            >
              {item.content}
            </button>
          )
        }

        return (
          <div key={item.id} className={classes}>
            {item.content}
          </div>
        )
      })}
    </div>
  )
}