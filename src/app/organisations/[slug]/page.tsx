import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArticleCard } from '@/components/ArticleCard'
import { getOrganizationBySlug, getArticlesByOrganization } from '@/lib/supabase/entities'
import { notFound } from 'next/navigation'

export const revalidate = 300

export default async function OrganizationPage({ params }: { params: { slug: string } }) {
  const organization = await getOrganizationBySlug(params.slug)

  if (!organization) {
    notFound()
  }

  const relatedArticles = await getArticlesByOrganization(organization.id)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          {organization.image && (
            <img 
              src={organization.image} 
              alt={organization.name}
              className="w-full h-48 object-cover border border-[var(--border)] mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3" style={{ fontSize: '32px' }}>
            {organization.name}
          </h1>
          {organization.description && (
            <p className="text-sm text-[var(--text-primary)]" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              {organization.description}
            </p>
          )}
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
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
        )}

      </main>

      <Footer />
    </div>
  )
}
