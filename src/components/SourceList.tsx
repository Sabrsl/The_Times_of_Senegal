import { Source } from '@/types'
import { ExternalLink } from 'lucide-react'

interface SourceListProps {
  sources: Source[]
}

const SOURCE_TYPE_LABELS: Record<Source['type'], string> = {
  government: 'Gouvernement',
  organization: 'Organisation',
  media: 'Média',
  official: 'Document officiel',
  statistical: 'Données statistiques',
  other: 'Autre',
}

function formatAccessedDate(dateString: string | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getSourceTypeLabel(type: Source['type']): string {
  return SOURCE_TYPE_LABELS[type] ?? type
}

/**
 * Valide l'URL avant de l'afficher : seuls http(s) sont acceptés.
 * Évite les liens `javascript:` ou malformés venant de la base de données.
 * Retourne aussi le nom de domaine, affiché comme repère de confiance.
 */
function parseSafeUrl(url: string | null | undefined): { href: string; host: string } | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return { href: parsed.href, host: parsed.hostname.replace(/^www\./, '') }
  } catch {
    return null
  }
}

export function SourceList({ sources }: SourceListProps) {
  if (!sources || sources.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="sources-heading"
      className="mt-4 border-t border-[var(--border)] pt-3 sm:mt-6 sm:pt-4"
    >
      <h2
        id="sources-heading"
        className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-primary)]"
      >
        Sources{' '}
        <span className="font-normal text-[var(--text-muted)]">({sources.length})</span>
      </h2>

      <ol className="space-y-0">
        {sources.map((source, index) => {
          const link = parseSafeUrl(source.url)

          return (
            <li key={source.id ?? index} className="flex gap-3">
              <span
                aria-hidden="true"
                className="shrink-0 text-sm font-medium text-[var(--text-muted)]"
              >
                {index + 1}.
              </span>

              <div className="flex-1">
                <p className="break-words text-sm leading-tight text-[var(--text-primary)]">
                  {source.name && (
                    <span className="font-medium">{source.name}</span>
                  )}
                  {source.name && (source.description || link || source.publishedAt) && ' - '}
                  {source.type && (
                    <span className="text-[var(--text-muted)]">({getSourceTypeLabel(source.type)})</span>
                  )}
                  {source.type && (source.description || link || source.publishedAt) && ' - '}
                  {source.description && (
                    <span>{source.description}</span>
                  )}
                  {source.description && link && ', '}
                  {link && (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-400 hover:text-blue-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                    >
                      {link.host}
                    </a>
                  )}
                  {source.publishedAt && (
                    <>
                      {(source.description || link) && ', '}
                      <span className="text-[var(--text-muted)]">consulté le {formatAccessedDate(source.publishedAt)}</span>
                    </>
                  )}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}