import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SourceList } from '@/components/SourceList'
import { ArticleCard } from '@/components/ArticleCard'
import { NewBadge } from '@/components/NewBadge'
import { ShareButton } from '@/components/ShareButton'
import { ViewCount } from '@/components/ViewCount'
import { ViewTracker } from '@/components/ViewTracker'
import { CommentForm } from '@/components/CommentForm'
import { CommentList } from '@/components/CommentList'
import { ScrollToTop } from '@/components/ScrollToTop'
import { DownloadPDF } from '@/components/DownloadPDF'
import { createPublicClient } from '@/lib/supabase/public'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { articlesCache, cachedQuery, generateCacheKey } from '@/lib/supabase/cache'

export const revalidate = 300

const TIME_ZONE = 'Africa/Dakar'

/* -------------------------------------------------------------------------- */
/*  Data (inchangé)                                                           */
/* -------------------------------------------------------------------------- */

async function getArticle(slug: string) {
  const cacheKey = generateCacheKey('article', { slug })
  return await cachedQuery(articlesCache, cacheKey, async () => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(name, slug),
        author:profiles(first_name, last_name),
        sources:article_sources(sources(*)),
        tags:article_tags(tags(*)),
        dossiers:article_dossiers(dossiers(*)),
        people:article_people(people(*)),
        organizations:article_organizations(organizations(*)),
        places:article_places(places(*))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      return null
    }

    return data
  })
}

async function getRelatedArticles(articleId: string, categorySlug?: string) {
  const cacheKey = generateCacheKey('related-articles', { articleId, categorySlug })
  return await cachedQuery(articlesCache, cacheKey, async () => {
    const supabase = createPublicClient()

    let query = supabase
      .from('articles')
      .select('id, title, slug, excerpt, published_at, category:categories(name, slug), featured_image')
      .eq('status', 'published')
      .neq('id', articleId)
      .order('published_at', { ascending: false })
      .limit(4)

    if (categorySlug) {
      query = query.eq('category.slug', categorySlug)
    }

    const { data } = await query
    return data || []
  })
}

async function getComments(articleId: string) {
  const supabase = createPublicClient()
  
  const { data } = await supabase
    .from('comments')
    .select('id, content, author_name, user_id, created_at')
    .eq('article_id', articleId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  
  return data || []
}

/* -------------------------------------------------------------------------- */
/*  Utilitaires                                                               */
/* -------------------------------------------------------------------------- */

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  })
}

function formatTime(dateString: string | null) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  })
}

/** Accepte uniquement des couleurs CSS plausibles (hex, rgb(), hsl(), nom). */
function getSafeColor(color?: string | null): string | null {
  if (!color) return null
  const value = color.trim()
  return /^[#a-zA-Z0-9(),.%\s/-]+$/.test(value) ? value : null
}

const chipBase =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors'

const chipNeutral = `${chipBase} border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--text-muted)]`

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(article.id, article.category?.slug)
  const comments = await getComments(article.id)

  // Format article data from Supabase to match expected structure
  const formattedArticle = {
    ...article,
    category: article.category?.name || '',
    author: article.author ? {
      name: `${article.author.first_name} ${article.author.last_name}`
    } : { name: 'Rédaction' },
    publishedAt: article.published_at || article.created_at,
    updatedAt: article.updated_at,
    image: article.featured_image,
    sources: article.sources?.map((s: any) => s.sources).filter(Boolean).map((s: any) => ({
      id: s.id,
      name: s.title || '',
      type: s.source_type === 'official' ? 'official' :
            s.source_type === 'media' ? 'media' :
            s.source_type === 'institution' ? 'organization' : 'other',
      url: s.url || undefined,
      description: s.publisher || '',
      publishedAt: s.published_at || new Date().toISOString()
    })) || []
  }

  // Groupes d'entités : même contenu qu'avant, rendu factorisé
  const entityGroups = [
    {
      label: 'Thèmes',
      base: '/tags',
      colored: true,
      items: (article.tags ?? []).map((r: any) => r.tags).filter(Boolean),
      getLabel: (i: any) => i.name,
    },
    {
      label: 'Dossiers',
      base: '/dossiers',
      colored: false,
      items: (article.dossiers ?? []).map((r: any) => r.dossiers).filter(Boolean),
      getLabel: (i: any) => i.title,
    },
    {
      label: 'Personnes',
      base: '/personnes',
      colored: false,
      items: (article.people ?? []).map((r: any) => r.people).filter(Boolean),
      getLabel: (i: any) => i.name,
    },
    {
      label: 'Organisations',
      base: '/organisations',
      colored: false,
      items: (article.organizations ?? []).map((r: any) => r.organizations).filter(Boolean),
      getLabel: (i: any) => i.name,
    },
    {
      label: 'Lieux',
      base: '/lieux',
      colored: false,
      items: (article.places ?? []).map((r: any) => r.places).filter(Boolean),
      getLabel: (i: any) => i.name,
    },
  ].filter((group) => group.items.length > 0)

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />
      <ViewTracker articleId={article.id} />

      <main id="contenu" className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
        {/* Category */}
        <div className="mb-1.5 flex items-center gap-2">
          {formattedArticle.category && (
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {formattedArticle.category}
            </span>
          )}
          <NewBadge publishedAt={formattedArticle.publishedAt} />
        </div>

        {/* Title */}
        <h1
          className="mb-4 text-[32px] font-bold leading-[1.15] tracking-[0.01em] text-[var(--text-primary)] sm:mb-5 sm:text-[44px] sm:leading-[1.12] sm:tracking-[0.015em]"
        >
          {formattedArticle.title}
        </h1>

        {/* Excerpt */}
        {formattedArticle.excerpt && (
          <p className="mb-10 text-[18px] leading-[1.65] text-[var(--text-secondary)] sm:text-[20px] sm:leading-[1.6]">
            {formattedArticle.excerpt}
          </p>
        )}

        {/* Metadata */}
        <div className="mb-3 flex flex-col gap-3 border-b border-[var(--border)] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
            <span>{formattedArticle.author.name}</span>
            <span aria-hidden="true">•</span>
            <span>Publié le {formatDate(formattedArticle.publishedAt)}</span>
            {formattedArticle.updatedAt && (
              <>
                <span aria-hidden="true">•</span>
                <span>Mis à jour à {formatTime(formattedArticle.updatedAt)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {article.view_count !== undefined && <ViewCount count={article.view_count} />}
            <ShareButton title={formattedArticle.title} url={`${process.env.NEXT_PUBLIC_APP_URL}/article/${article.slug}`} />
            <DownloadPDF
              articleId={article.id}
              articleTitle={formattedArticle.title}
              articleSlug={article.slug}
              publishedAt={article.published_at}
            />
          </div>
        </div>

        {/* Main Image */}
        {formattedArticle.image && (
          <div className="mb-4 aspect-[16/9] overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] sm:aspect-[3/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formattedArticle.image}
              alt={formattedArticle.title}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article
          className="prose mb-4 max-w-none text-[18px] leading-[1.65] prose-p:my-0 prose-headings:font-semibold sm:text-[20px] sm:leading-[1.6]"
        >
          <div
            className="space-y-5 text-[var(--text-primary)]"
            dangerouslySetInnerHTML={{ __html: formattedArticle.content }}
          />
        </article>

        {/* Sources */}
        {formattedArticle.sources && formattedArticle.sources.length > 0 && (
          <SourceList sources={formattedArticle.sources} />
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-6 border-t border-[var(--border)] pt-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
              Articles liés
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-1">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.id}
                  article={{
                    ...relatedArticle,
                    content: '',
                    publishedAt: relatedArticle.published_at,
                    sources: [],
                    category: relatedArticle.category?.[0] || ''
                  }}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}

        {/* Entities & Classifications */}
        {entityGroups.length > 0 && (
          <section className="mt-6 border-t border-[var(--border)] pt-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
              Thèmes & Entités
            </h2>

            <div className="space-y-3">
              {entityGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="mb-1.5 text-xs font-medium text-[var(--text-muted)]">{group.label}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item: any) => {
                      const href = `${group.base}/${encodeURIComponent(item.slug)}`
                      const color = group.colored ? getSafeColor(item.color) : null

                      // Thème avec couleur : teinte construite avec color-mix
                      // (l'ancien `couleur + '20'` cassait avec un nom ou un hex court)
                      return color ? (
                        <Link
                          key={item.id}
                          href={href}
                          className={`${chipBase} hover:opacity-80`}
                          style={{
                            backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                            color,
                            border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
                          }}
                        >
                          {group.getLabel(item)}
                        </Link>
                      ) : (
                        <Link key={item.id} href={href} className={chipNeutral}>
                          {group.getLabel(item)}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="mt-6 border-t border-[var(--border)] pt-4" data-no-print>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
            Commentaires
          </h2>

          <div className="mb-4">
            <CommentForm articleId={article.id} />
          </div>

          <CommentList comments={comments} max={3} />

          {comments.length > 0 && (
            <div className="mt-3 text-center">
              <Link
                href={`/article/${article.slug}/comments`}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Voir tous les commentaires ({comments.length})
              </Link>
            </div>
          )}
        </section>

        {/* Scroll to Top Button */}
        <div className="mt-6 flex justify-center">
          <ScrollToTop />
        </div>
      </main>

      <Footer />
    </div>
  )
}
