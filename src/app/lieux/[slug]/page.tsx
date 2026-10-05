import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArticleCard } from '@/components/ArticleCard'
import { getPlaceBySlug, getArticlesByPlace } from '@/lib/supabase/entities'
import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'

export const revalidate = 300

export default async function LocationPage({ params }: { params: { slug: string } }) {
  const place = await getPlaceBySlug(params.slug)

  if (!place) {
    notFound()
  }

  const relatedArticles = await getArticlesByPlace(place.id)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          {place.image && (
            <img 
              src={place.image} 
              alt={place.name}
              className="w-full h-48 object-cover border border-[var(--border)] mb-4"
            />
          )}
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-3" style={{ fontSize: '11px' }}>
            <MapPin size={12} />
            <span>Lieu</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3" style={{ fontSize: '32px' }}>
            {place.name}
          </h1>
          {place.description && (
            <p className="text-sm text-[var(--text-primary)]" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              {place.description}
            </p>
          )}
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
              Actualités liées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        ) : (
          <section className="text-center py-12">
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Aucune actualité liée pour le moment.
            </p>
          </section>
        )}

      </main>

      <Footer />
    </div>
  )
}
