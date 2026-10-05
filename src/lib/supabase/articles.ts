import { createClient } from './server'
import { cachedQuery, articlesCache, categoriesCache, generateCacheKey } from './cache'

export async function getArticlesByCategory(categorySlug: string) {
  const cacheKey = generateCacheKey('articles_by_category', { categorySlug })

  return cachedQuery(articlesCache, cacheKey, async () => {
    const supabase = await createClient()

    // Get category ID and articles in parallel for better performance
    const [categoryResult, articlesResult] = await Promise.all([
      supabase.from('categories').select('id').eq('slug', categorySlug).single(),
      supabase
        .from('articles')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
    ])

    if (!categoryResult.data) {
      return []
    }

    // Filter articles by category_id on the client side (faster than a second query)
    const articles = articlesResult.data?.filter(
      (article: any) => article.category_id === categoryResult.data.id
    ) || []

    if (articles.length === 0) {
      return []
    }

    // Map Supabase field names to match Article type
    return articles.map((article: any) => ({
      ...article,
      publishedAt: article.published_at,
      updatedAt: article.updated_at,
      image: article.featured_image
    }))
  })
}

export async function getDossiers() {
  const cacheKey = 'all_dossiers'

  return cachedQuery(articlesCache, cacheKey, async () => {
    const supabase = await createClient()

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
