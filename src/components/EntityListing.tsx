import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

interface EntityItem {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  color?: string
  subtitle?: string
}

type ItemType = 'tag' | 'person' | 'organization' | 'place' | 'dossier' | 'event'

interface EntityListingProps {
  title: string
  items: EntityItem[]
  itemType: ItemType
}

/* -------------------------------------------------------------------------- */
/*  Configuration                                                             */
/* -------------------------------------------------------------------------- */

const BASE_PATHS: Record<ItemType, string> = {
  tag: '/tags',
  person: '/personnes',
  organization: '/organisations',
  place: '/lieux',
  dossier: '/dossiers',
  event: '/events',
}

/** Messages d'état vide accordés correctement (« Aucune personne », « Aucun lieu »…). */
const EMPTY_MESSAGES: Record<ItemType, string> = {
  tag: 'Aucun thème pour le moment.',
  person: 'Aucune personne pour le moment.',
  organization: 'Aucune organisation pour le moment.',
  place: 'Aucun lieu pour le moment.',
  dossier: 'Aucun dossier pour le moment.',
  event: 'Aucun événement pour le moment.',
}

function getItemUrl(itemType: ItemType, slug: string) {
  return `${BASE_PATHS[itemType]}/${encodeURIComponent(slug)}`
}

/** N'accepte que des valeurs de couleur CSS plausibles (hex, rgb(), hsl(), nom). */
function getSafeColor(color?: string): string | null {
  if (!color) return null
  const value = color.trim()
  return /^[#a-zA-Z0-9(),.%\s/-]+$/.test(value) ? value : null
}

/* -------------------------------------------------------------------------- */
/*  Composant                                                                 */
/* -------------------------------------------------------------------------- */

export function EntityListing({ title, items, itemType }: EntityListingProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />

      <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="mb-5 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:mb-8 sm:text-3xl">
          {title}
        </h1>

        {items.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {items.map((item) => {
              // La couleur n'est utilisée que pour les thèmes, comme avant
              const color = itemType === 'tag' ? getSafeColor(item.color) : null

              return (
                <li key={item.id} className="min-w-0">
                  <Link
                    href={getItemUrl(itemType, item.slug)}
                    className="group flex h-full flex-col border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--text-muted)] active:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:p-6"
                  >
                    {item.image && (
                      // Image décorative : le nom est déjà porté par le titre du lien
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="mb-3 h-28 w-full border border-[var(--border)] object-cover sm:mb-4 sm:h-32"
                      />
                    )}

                    {item.subtitle && (
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                        {item.subtitle}
                      </p>
                    )}

                    <h2 className="flex items-center gap-2 text-base font-semibold leading-snug text-[var(--text-primary)] sm:text-lg">
                      {color && (
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: color,
                            boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 20%, transparent)`,
                          }}
                        />
                      )}
                      <span className="min-w-0 break-words group-hover:underline">{item.name}</span>
                    </h2>

                    {item.description && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {item.description}
                      </p>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <div
            aria-live="polite"
            className="border border-[var(--border)] px-6 py-12 text-center sm:py-16"
          >
            <p className="text-sm text-[var(--text-secondary)]">{EMPTY_MESSAGES[itemType]}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}