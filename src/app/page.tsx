import type { ReactNode } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArticleCard } from '@/components/ArticleCard'
import { DateTimeDisplay } from '@/components/DateTimeDisplay'
import { BentoGrid } from '@/components/BentoGrid'
import { FeaturedArticle } from '@/components/bento/BentoItem'
import { createPublicClient } from '@/lib/supabase/public'
import { articlesCache, cachedQuery } from '@/lib/supabase/cache'

/**
 * Régénération de la page toutes les 5 minutes (ISR) :
 * la home reste rapide et le contenu se met à jour sans redéploiement.
 */
export const revalidate = 300

const ARTICLES_LIMIT = 20
const BENTO_COUNT = 8

/**
 * Disposition type news, une taille par position du bento.
 * Mobile (2 col) : 1 grand, 4 petits (2 par ligne), 1 large, 2 petits.
 * Desktop (4 col) : 1 grand à gauche (2x2), 4 petits à droite, puis 1 large + 2 petits.
 */
const BENTO_SIZES: ReadonlyArray<'large' | 'medium' | 'small'> = [
  'large',
  'small',
  'small',
  'small',
  'small',
  'medium',
  'small',
  'small',
]

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

async function getArticles() {
  try {
    return await cachedQuery(
      articlesCache,
      'homepage-articles',
      async () => {
        const supabase = createPublicClient()

        const { data, error } = await supabase
          .from('articles')
          .select(
            `
            *,
            category:categories(name, slug)
          `
          )
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(ARTICLES_LIMIT)

        if (error) {
          console.error('[HomePage] Erreur Supabase :', error.message)
          return []
        }

        if (!data?.length) return []

        // Adapte les noms de colonnes Supabase au type Article (inchangé)
        return data.map((article: any) => ({
          ...article,
          publishedAt: article.published_at,
          updatedAt: article.updated_at,
          image: article.featured_image,
        }))
      }
    )
  } catch (err) {
    // Une panne réseau ou de config ne doit jamais faire planter la page
    console.error('[HomePage] Erreur inattendue :', err)
    return []
  }
}

/** Date au format français, ou undefined si elle est absente ou invalide. */
function formatDate(value?: string | null): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toLocaleDateString('fr-FR')
}

/* -------------------------------------------------------------------------- */
/*  UI                                                                        */
/* -------------------------------------------------------------------------- */

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-4 sm:mb-6">
      <h2
        id={id}
        className="text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]"
      >
        {children}
      </h2>
      <div className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
    </div>
  )
}

export default async function HomePage() {
  const articles = await getArticles()
  const hasArticles = articles.length > 0

  // Bento : les 8 premiers articles
  const bentoItems = articles.slice(0, BENTO_COUNT).map((article, index) =>
    FeaturedArticle({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt ?? undefined,
      image: article.image ?? undefined,
      category: article.category?.name ?? undefined,
      author: article.author ?? undefined,
      date: formatDate(article.publishedAt ?? article.created_at),
      href: `/article/${article.slug}`,
      size: BENTO_SIZES[index] ?? 'small',
    })
  )

  // Liste : uniquement les articles absents du bento, donc aucun doublon
  const latest = articles.slice(BENTO_COUNT)

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />

      <main
        id="contenu"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        {/* Date et heure */}
        <div className="mb-6 sm:mb-8">
          <DateTimeDisplay />
        </div>

        {!hasArticles ? (
          <section
            aria-live="polite"
            className="border border-[var(--border)] px-6 py-16 text-center sm:py-24"
          >
            <p className="text-sm text-[var(--text-secondary)]">
              Aucun article publié pour le moment.
            </p>
          </section>
        ) : (
          <>
            {/* Bento Grid */}
            <section aria-label="En vedette" className="mb-10 sm:mb-12">
              <BentoGrid items={bentoItems} />
            </section>

            {/* Dernières actualités */}
            {latest.length > 0 && (
              <section aria-labelledby="latest-heading">
                <SectionTitle id="latest-heading">Dernières actualités</SectionTitle>

                <div className="border-t border-[var(--border)]">
                  {latest.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="compact" />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}