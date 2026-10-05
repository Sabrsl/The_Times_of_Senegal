import Link from 'next/link'
import Image from 'next/image'
import { Article } from '@/types'
import { Clock } from 'lucide-react'
import { NewBadge } from './NewBadge'
import { CategoryBadge } from './CategoryBadge'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'compact' | 'featured'
}

/* -------------------------------------------------------------------------- */
/*  Utilitaires                                                               */
/* -------------------------------------------------------------------------- */

const HOUR_MS = 60 * 60 * 1000

/** Fuseau fixe : le rendu serveur et navigateur affichent la même heure. */
const TIME_ZONE = 'Africa/Dakar'

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function hoursSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / HOUR_MS)
}

/** « À l'instant », « Il y a 3h », « Hier » ou « 12 oct. » */
function formatDate(date: Date | null): string {
  if (!date) return ''
  const hours = hoursSince(date)

  // Inclut les dates légèrement futures (décalage d'horloge) : plus de « Il y a -1h »
  if (hours < 1) return "À l'instant"
  if (hours < 24) return `Il y a ${hours}h`
  if (hours < 48) return 'Hier'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: TIME_ZONE })
}

function formatTime(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  })
}

function getCategoryName(article: Article): string | undefined {
  return typeof article.category === 'string' ? article.category : article.category?.name
}

function getCategorySlug(article: Article): string | undefined {
  return typeof article.category === 'string' ? article.category : article.category?.slug
}

/* -------------------------------------------------------------------------- */
/*  Styles partagés                                                           */
/* -------------------------------------------------------------------------- */

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]'

const titleHover =
  'transition-colors group-hover:text-[var(--accent)] group-focus-visible:text-[var(--accent)]'

/* -------------------------------------------------------------------------- */
/*  Sous-composants                                                           */
/* -------------------------------------------------------------------------- */

function CardImage({
  src,
  publishedAt,
  priority,
}: {
  src: string
  publishedAt: string | null | undefined
  priority?: boolean
}) {
  return (
    <div className="relative aspect-[3/2] overflow-hidden bg-[var(--surface-muted)]">
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
      />
      <div className="absolute right-2 top-2">
        <NewBadge publishedAt={publishedAt} />
      </div>
    </div>
  )
}

function Meta({ date, author }: { date: Date | null; author?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--text-muted)]">
      <Clock size={12} aria-hidden="true" className="shrink-0" />
      {date && <time dateTime={date.toISOString()}>{formatDate(date)}</time>}
      {author && (
        <>
          <span aria-hidden="true">•</span>
          <span>{author}</span>
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Composant principal                                                       */
/* -------------------------------------------------------------------------- */

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const href = `/article/${article.slug}`
  const date = toDate(article.publishedAt)
  const category = getCategoryName(article)
  const categorySlug = getCategorySlug(article)

  /* ---- Compact : liste chronologique ------------------------------------ */
  if (variant === 'compact') {
    // Sous l'heure, on précise le jour pour les articles de plus de 24 h
    const dayLabel = date && hoursSince(date) >= 24 ? formatDate(date) : ''

    return (
      // La bordure est portée par <article> (et non par un enfant unique du lien),
      // sinon `last:` s'appliquait toujours et les séparateurs n'apparaissaient jamais.
      <article className="border-b border-[var(--border)] last:border-b-0">
        <Link
          href={href}
          className={`group -mx-2 flex gap-3 px-2 py-3 transition-colors hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] ${focusRing}`}
        >
          <div className="w-12 shrink-0 text-[11px] leading-tight tabular-nums text-[var(--text-muted)]">
            {date && <time dateTime={date.toISOString()}>{formatTime(date)}</time>}
            {dayLabel && <div className="mt-0.5">{dayLabel}</div>}
          </div>

          <div className="min-w-0 flex-1">
            {(category || date) && (
              <div className="mb-1 flex items-center gap-2">
                <CategoryBadge slug={categorySlug} name={category} />
                <NewBadge publishedAt={article.publishedAt} />
              </div>
            )}

            <h3 className={`line-clamp-2 text-sm font-medium leading-snug text-[var(--text-primary)] ${titleHover}`}>
              {article.title}
            </h3>

            {article.excerpt && (
              <p className="mt-1 line-clamp-1 text-xs text-[var(--text-secondary)]">
                {article.excerpt}
              </p>
            )}
          </div>
        </Link>
      </article>
    )
  }

  /* ---- À la une / standard : carte verticale ---------------------------- */
  const isFeatured = variant === 'featured'
  const Heading = isFeatured ? 'h2' : 'h3'

  return (
    <article className={isFeatured ? undefined : 'h-full'}>
      <Link
        href={href}
        className={`group flex flex-col border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--border-strong)] active:bg-[var(--surface-muted)] ${focusRing} ${
          isFeatured ? '' : 'h-full'
        }`}
      >
        {article.image && (
          <CardImage src={article.image} publishedAt={article.publishedAt} priority={isFeatured} />
        )}

        <div className="flex flex-1 flex-col p-4">
          {(category || !article.image) && (
            <div className="mb-2 flex items-center gap-2">
              <CategoryBadge slug={categorySlug} name={category} />
              {/* Sans image, le badge se place ici plutôt que sur la photo */}
              {!article.image && <NewBadge publishedAt={article.publishedAt} />}
            </div>
          )}

          <Heading
            className={`mb-2 line-clamp-3 sm:line-clamp-2 leading-snug text-[var(--text-primary)] ${titleHover} ${
              isFeatured ? 'text-xl font-bold sm:text-2xl' : 'text-base font-semibold'
            }`}
          >
            {article.title}
          </Heading>

          {article.excerpt && (
            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              {article.excerpt}
            </p>
          )}

          <div className="mt-auto">
            <Meta date={date} author={isFeatured ? article.author?.name : undefined} />
          </div>
        </div>
      </Link>
    </article>
  )
}