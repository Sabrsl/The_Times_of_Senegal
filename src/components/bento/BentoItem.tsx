import { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { BentoItem } from '../BentoGrid'

/* -------------------------------------------------------------------------- */
/*  Article à la une                                                          */
/* -------------------------------------------------------------------------- */

export interface FeaturedArticleProps {
  id: string
  title: string
  excerpt?: string
  image?: string
  category?: string
  author?: string
  date?: string
  href: string
  size?: 'large' | 'medium' | 'small'
}

const TITLE_CLASSES: Record<NonNullable<FeaturedArticleProps['size']>, string> = {
  large: 'line-clamp-3 text-lg sm:text-2xl',
  medium: 'line-clamp-2 text-base sm:text-lg',
  small: 'line-clamp-2 text-sm sm:text-base',
}

const EXCERPT_CLASSES: Record<NonNullable<FeaturedArticleProps['size']>, string | null> = {
  large: 'line-clamp-3',
  medium: 'hidden sm:line-clamp-2',
  small: null, // trop compact pour afficher un extrait
}

const CHIP_CLASSES =
  'inline-flex max-w-full items-center truncate rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-primary)] backdrop-blur-sm'

function ArticleMeta({ author, date }: { author?: string; date?: string }) {
  if (!author && !date) return null

  return (
    <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-[var(--text-muted)]">
      {author && <span className="truncate font-medium">{author}</span>}
      {author && date && <span aria-hidden="true">•</span>}
      {date && <span className="shrink-0">{date}</span>}
    </p>
  )
}

export function FeaturedArticle({
  id,
  title,
  excerpt,
  image,
  category,
  author,
  date,
  href,
  size = 'large',
}: FeaturedArticleProps): BentoItem {
  const excerptClass = EXCERPT_CLASSES[size]

  return {
    id,
    size,
    href,
    content: (
      <div
        className={`group flex h-full min-h-0 flex-col overflow-hidden ${
          image ? '' : 'justify-between bg-gradient-to-br from-[var(--surface-muted)] to-transparent'
        }`}
      >
        {image ? (
          // L'image s'adapte à la hauteur de la cellule : elle grandit s'il reste de la place
          // et rétrécit si la cellule est courte, le texte garde toujours sa place.
          <div className="relative aspect-[16/10] min-h-28 min-w-0 shrink grow overflow-hidden bg-[var(--surface-muted)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
            />
            {category && (
              <span className={`${CHIP_CLASSES} absolute left-3 top-3`}>{category}</span>
            )}
          </div>
        ) : (
          category && (
            <div className="p-4 pb-0 sm:p-5 sm:pb-0">
              <span className={CHIP_CLASSES}>{category}</span>
            </div>
          )
        )}

        <div className="flex shrink-0 flex-col gap-2 p-4 sm:p-5">
          <h3
            className={`font-semibold leading-snug tracking-tight text-[var(--text-primary)] ${TITLE_CLASSES[size]}`}
          >
            {title}
          </h3>
          {excerpt && excerptClass && (
            <p className={`text-sm leading-relaxed text-[var(--text-secondary)] ${excerptClass}`}>
              {excerpt}
            </p>
          )}
          <ArticleMeta author={author} date={date} />
        </div>
      </div>
    ),
  }
}

/* -------------------------------------------------------------------------- */
/*  Catégorie                                                                 */
/* -------------------------------------------------------------------------- */

export interface CategoryCardProps {
  id: string
  name: string
  count?: number
  color?: string
  href: string
  size?: 'small' | 'medium'
}

export function CategoryCard({
  id,
  name,
  count,
  color,
  href,
  size = 'small',
}: CategoryCardProps): BentoItem {
  const backgroundStyle = color
    ? { backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }
    : undefined

  return {
    id,
    size,
    href,
    content: (
      <div
        className="group flex h-full min-h-0 flex-col items-center justify-center gap-1.5 p-4 text-center sm:p-6"
        style={backgroundStyle}
      >
        {color && (
          <span
            aria-hidden="true"
            className="mb-1 h-1.5 w-8 rounded-full transition-all duration-300 group-hover:w-12 motion-reduce:transition-none"
            style={{ backgroundColor: color }}
          />
        )}
        <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg">
          {name}
        </h3>
        {count !== undefined && (
          <p className="text-sm tabular-nums text-[var(--text-muted)]">
            {count.toLocaleString('fr-FR')} {count > 1 ? 'articles' : 'article'}
          </p>
        )}
      </div>
    ),
  }
}

/* -------------------------------------------------------------------------- */
/*  Statistique                                                               */
/* -------------------------------------------------------------------------- */

export interface StatCardProps {
  id: string
  label: string
  value: string | number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  size?: 'small' | 'medium'
}

const TREND_STYLES: Record<
  NonNullable<StatCardProps['trend']>,
  { color: string; Icon: typeof ArrowUpRight; label: string }
> = {
  up: { color: 'text-green-600 dark:text-green-400', Icon: ArrowUpRight, label: 'En hausse' },
  down: { color: 'text-red-600 dark:text-red-400', Icon: ArrowDownRight, label: 'En baisse' },
  neutral: { color: 'text-[var(--text-muted)]', Icon: Minus, label: 'Stable' },
}

export function StatCard({
  id,
  label,
  value,
  icon,
  trend,
  trendValue,
  size = 'small',
}: StatCardProps): BentoItem {
  const trendStyle = trend ? TREND_STYLES[trend] : null

  return {
    id,
    size,
    content: (
      <div className="flex h-full min-h-0 flex-col justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {label}
            </p>
            <p className="mt-2 truncate text-2xl font-bold tabular-nums tracking-tight text-[var(--text-primary)] sm:text-3xl">
              {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
            </p>
          </div>
          {icon && (
            <div aria-hidden="true" className="shrink-0 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
        </div>
        {trendStyle && trendValue && (
          <p className={`flex items-center gap-1 text-xs font-medium ${trendStyle.color}`}>
            <trendStyle.Icon size={14} aria-hidden="true" />
            <span className="sr-only">{trendStyle.label} : </span>
            {trendValue}
          </p>
        )}
      </div>
    ),
  }
}

/* -------------------------------------------------------------------------- */
/*  Lien rapide                                                               */
/* -------------------------------------------------------------------------- */

export interface QuickLinkProps {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  href: string
  size?: 'small' | 'medium'
}

export function QuickLink({
  id,
  label,
  description,
  icon,
  href,
  size = 'small',
}: QuickLinkProps): BentoItem {
  return {
    id,
    size,
    href,
    content: (
      <div className="group flex h-full min-h-0 flex-col items-center justify-center gap-1 p-4 text-center sm:p-6">
        {icon && (
          <div
            aria-hidden="true"
            className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition-colors group-hover:border-[var(--border-strong)] group-hover:text-[var(--text-primary)] motion-reduce:transition-none"
          >
            {icon}
          </div>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold text-[var(--text-primary)]">{label}</h3>
        {description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>
    ),
  }
}