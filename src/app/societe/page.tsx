import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArticleCard } from '@/components/ArticleCard'
import { getArticlesByCategory } from '@/lib/supabase/articles'

export const revalidate = 300

export default async function SocietePage() {
  const articles = await getArticlesByCategory('societe')

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Société
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Actualités sociétales et questions de société au Sénégal
          </p>
        </section>

        {articles.length > 0 && (
          <section className="mb-8">
            <ArticleCard article={articles[0]} variant="featured" />
          </section>
        )}

        {articles.length > 1 && (
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.slice(1).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {articles.length === 0 && (
          <section className="mt-12 p-12 text-center border border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Aucun article publié dans cette catégorie pour le moment.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
