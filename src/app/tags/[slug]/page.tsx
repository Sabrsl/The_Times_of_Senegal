import { EntityLayout } from '@/components/EntityLayout'
import { createPublicClient } from '@/lib/supabase/public'
import { notFound } from 'next/navigation'

export const revalidate = 300

async function getTag(slug: string) {
  const supabase = createPublicClient()
  
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getRelatedArticles(tagId: string) {
  const supabase = createPublicClient()
  
  const { data, error } = await supabase
    .from('article_tags')
    .select(`
      articles(
        *,
        category:categories(name, slug)
      )
    `)
    .eq('tag_id', tagId)

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

export default async function TagPage({ params }: { params: { slug: string } }) {
  const tag = await getTag(params.slug)

  if (!tag) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(tag.id)

  return (
    <EntityLayout
      title={tag.name}
      subtitle="Thème"
      description={tag.description}
      relatedArticles={relatedArticles}
    >
      <div className="flex flex-wrap gap-2 mb-6">
        <span 
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: tag.color + '20',
            color: tag.color,
            border: `1px solid ${tag.color}40`
          }}
        >
          {tag.name}
        </span>
      </div>
    </EntityLayout>
  )
}
