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

      <ol className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-8">
        {sources.map((source, index) => {
          const link = parseSafeUrl(source.url)

          return (
            <li key={source.id ?? index} className="flex min-w-0 gap-2 sm:gap-3">
              <span
                aria-hidden="true"
                className="w-5 shrink-0 pt-0.5 text-[11px] sm:w-6 tabular-nums text-[var(--text-muted)]"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium leading-tight text-[var(--text-primary)]">
                  {source.name}
                </p>

                <p className="text-xs leading-tight text-[var(--text-muted)]">
                  {getSourceTypeLabel(source.type)}
                </p>

                {source.description && (
                  <p className="break-words text-xs leading-tight text-[var(--text-secondary)]">
                    {source.description}
                  </p>
                )}

                {link && (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-ml-1 mt-0.5 inline-flex min-h-7 max-w-full items-center gap-1.5 rounded px-1 text-xs text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:min-h-0 sm:py-0"
                  >
                    <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
                    <span className="truncate">
                      <span className="hidden sm:inline">Voir la source · </span>
                      {link.host}
                    </span>
                    <span className="sr-only">
                      {' '}
                      (s&apos;ouvre dans un nouvel onglet) — {source.name}
                    </span>
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}