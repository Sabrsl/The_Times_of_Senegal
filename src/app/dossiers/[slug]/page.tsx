import { EntityLayout } from '@/components/EntityLayout'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const revalidate = 300

async function getDossier(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('dossiers')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getRelatedArticles(dossierId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('article_dossiers')
    .select(`
      articles(
        *,
        category:categories(name, slug)
      )
    `)
    .eq('dossier_id', dossierId)

  if (error || !data) {
    return []
  }

  return data.map((item: any) => ({
    ...item.articles,
    publishedAt: item.articles.published_at,
    updatedAt: item.articles.updated_at,
    image: item.articles.featured_image,
    category: item.articles.category?.name || ''
  }))
}

export default async function DossierPage({ params }: { params: { slug: string } }) {
  const dossier = await getDossier(params.slug)

  if (!dossier) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(dossier.id)

  return (
    <EntityLayout
      title={dossier.title}
      subtitle="Dossier thématique"
      image={dossier.featured_image}
      description={dossier.description}
      relatedArticles={relatedArticles}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedArticles.length > 0 ? (
          relatedArticles.map((article) => (
            <div key={article.id} className="bg-[var(--surface)] border border-[var(--border)] p-4">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">{article.title}</h3>
              <p className="text-xs text-[var(--text-secondary)]">{article.excerpt}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--text-secondary)] col-span-full">
            Aucun article dans ce dossier pour le moment.
          </p>
        )}
      </div>
    </EntityLayout>
  )
}
