import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getPersonBySlug, getArticlesByPerson, getDossiersByPerson } from '@/lib/supabase/entities'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 300

export default async function PersonPage({ params }: { params: { slug: string } }) {
  const person = await getPersonBySlug(params.slug)

  if (!person) {
    notFound()
  }

  const relatedArticles = await getArticlesByPerson(person.id)
  const relatedDossiers = await getDossiersByPerson(person.id)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <div className="flex items-start gap-6">
            {/* Photo placeholder */}
            {person.image ? (
              <img 
                src={person.image} 
                alt={person.name}
                className="w-24 h-24 object-cover border border-[var(--border)] flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 bg-[var(--surface-muted)] border border-[var(--border)] flex-shrink-0 flex items-center justify-center text-[var(--text-muted)] text-xs">
                Photo
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
                {person.name}
              </h1>
              {person.description && (
                <p className="text-sm text-[var(--text-primary)]" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  {person.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Related Dossiers */}
        {relatedDossiers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
              Dossiers liés
            </h2>
            <div className="space-y-2">
              {relatedDossiers.map((dossier: any) => (
                <Link
                  key={dossier.id}
                  href={`/dossiers/${dossier.slug}`}
                  className="block p-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
                >
                  <h3 className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                    {dossier.title}
                  </h3>
                  {dossier.description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1" style={{ fontSize: '12px' }}>
                      {dossier.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
              Actualités liées
            </h2>
            <div className="space-y-2">
              {relatedArticles.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="block p-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
                >
                  <h3 className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1" style={{ fontSize: '12px' }}>
                      {article.excerpt}
                    </p>
                  )}
                  {article.publishedAt && (
                    <p className="text-xs text-[var(--text-muted)] mt-2" style={{ fontSize: '11px' }}>
                      {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  )
}
