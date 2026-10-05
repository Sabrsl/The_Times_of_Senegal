import { createClient } from './server'
import { cachedQuery, entitiesCache, articlesCache, generateCacheKey } from './cache'

/**
 * Get person by slug with caching
 */
export async function getPersonBySlug(slug: string) {
  const cacheKey = generateCacheKey('person_by_slug', { slug })

  return cachedQuery(entitiesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return null
    }

    return data
  })
}

/**
 * Get organization by slug with caching
 */
export async function getOrganizationBySlug(slug: string) {
  const cacheKey = generateCacheKey('organization_by_slug', { slug })

  return cachedQuery(entitiesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return null
    }

    return data
  })
}

/**
 * Get place by slug with caching
 */
export async function getPlaceBySlug(slug: string) {
  const cacheKey = generateCacheKey('place_by_slug', { slug })

  return cachedQuery(entitiesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return null
    }

    return data
  })
}

/**
 * Get event by slug with caching
 */
export async function getEventBySlug(slug: string) {
  const cacheKey = generateCacheKey('event_by_slug', { slug })

  return cachedQuery(entitiesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return null
    }

    return data
  })
}

/**
 * Get articles related to a person with caching
 */
export async function getArticlesByPerson(personId: string) {
  const cacheKey = generateCacheKey('articles_by_person', { personId })

  return cachedQuery(articlesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('article_people')
      .select(`
        articles(
          *,
          category:categories(name, slug)
        )
      `)
      .eq('person_id', personId)

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
  })
}

/**
 * Get articles related to an organization with caching
 */
export async function getArticlesByOrganization(organizationId: string) {
  const cacheKey = generateCacheKey('articles_by_organization', { organizationId })

  return cachedQuery(articlesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('article_organizations')
      .select(`
        articles(
          *,
          category:categories(name, slug)
        )
      `)
      .eq('organization_id', organizationId)

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
  })
}

/**
 * Get articles related to a place with caching
 */
export async function getArticlesByPlace(placeId: string) {
  const cacheKey = generateCacheKey('articles_by_place', { placeId })

  return cachedQuery(articlesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('article_places')
      .select(`
        articles(
          *,
          category:categories(name, slug)
        )
      `)
      .eq('place_id', placeId)

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
  })
}

/**
 * Get articles related to an event with caching
 */
export async function getArticlesByEvent(eventId: string) {
  const cacheKey = generateCacheKey('articles_by_event', { eventId })

  return cachedQuery(articlesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('article_events')
      .select(`
        articles(
          *,
          category:categories(name, slug)
        )
      `)
      .eq('event_id', eventId)

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
  })
}

/**
 * Get all people with caching
 */
export async function getAllPeople() {
  const cacheKey = 'all_people'

  return cachedQuery(entitiesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('name')

    if (error || !data) {
      return []
    }

    return data
  })
}

/**
 * Get all organizations with caching
 */
export async function getAllOrganizations() {
  const cacheKey = 'all_organizations'

  return cachedQuery(entitiesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name')

    if (error || !data) {
      return []
    }

    return data
  })
}

/**
 * Get all places with caching
 */
export async function getAllPlaces() {
  const cacheKey = 'all_places'

  return cachedQuery(entitiesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('name')

    if (error || !data) {
      return []
    }

    return data
  })
}

/**
 * Get all events with caching
 */
export async function getAllEvents() {
  const cacheKey = 'all_events'

  return cachedQuery(entitiesCache, cacheKey, async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })

    if (error || !data) {
      return []
    }

    return data
  })
}
