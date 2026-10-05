import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArticleCard } from '@/components/ArticleCard'
import { getArticlesByCategory } from '@/lib/supabase/articles'
import { createPublicClient } from '@/lib/supabase/public'
import { notFound } from 'next/navigation'

export const revalidate = 0

export async function generateStaticParams() {
  const supabase = createPublicClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .eq('is_visible', true)

  return (categories || []).map((category) => ({
    slug: category.slug,
  }))
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const articles = await getArticlesByCategory(params.slug)

  // Get category details
  const supabase = createPublicClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', params.slug)
    .single()

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Category Header */}
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              {category.description}
            </p>
          )}
        </section>

        {/* Featured Article */}
        {articles.length > 0 && (
          <section className="mb-8">
            <ArticleCard article={articles[0]} variant="featured" />
          </section>
        )}

        {/* Articles Grid */}
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
