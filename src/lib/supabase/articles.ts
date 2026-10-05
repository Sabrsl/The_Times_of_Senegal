import { createPublicClient } from './public'
import { cachedQuery, articlesCache, categoriesCache, generateCacheKey } from './cache'

export async function getArticlesByCategory(categorySlug: string) {
  const supabase = createPublicClient()

  // Get category ID first (use cache if available)
  const categoryCacheKey = generateCacheKey('category-id', { slug: categorySlug })
  const category = await cachedQuery(categoriesCache, categoryCacheKey, async () => {
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    return data
  })

  if (!category) {
    return []
  }

  // Get articles filtered by category_id on server side (no cache inside, but outer call is cached)
  const { data: articles } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })

  if (!articles || articles.length === 0) {
    return []
  }

  // Map Supabase field names to match Article type
  return articles.map((article: any) => ({
    ...article,
    publishedAt: article.published_at,
    updatedAt: article.updated_at,
    image: article.featured_image
  }))
}

export async function getDossiers() {
  const cacheKey = 'all_dossiers'

  return cachedQuery(articlesCache, cacheKey, async () => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('dossiers')
      .select(`
        *,
        dossier_articles(article_id)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return []
    }

    return data.map((dossier: any) => ({
      ...dossier,
      articles: dossier.dossier_articles?.map((da: any) => da.article_id) || []
    }))
  })
}
