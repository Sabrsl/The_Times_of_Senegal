/**
 * Server-side cache for Supabase queries
 * Reduces database load during development and between ISR revalidations
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class ServerCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private ttl: number // milliseconds

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > this.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(): void {
    this.cache.clear()
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Separate caches for different data types
export const articlesCache = new ServerCache(5) // 5 minutes for articles
export const entitiesCache = new ServerCache(10) // 10 minutes for entities (people, orgs, places)
export const categoriesCache = new ServerCache(15) // 15 minutes for categories (rarely change)

/**
 * Wrapper for Supabase queries with caching
 */
export async function cachedQuery<T>(
  cache: ServerCache,
  key: string,
  queryFn: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Execute query
  const result = await queryFn()

  // Cache the result
  cache.set(key, result)

  return result
}

/**
 * Generate cache key from query parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join('&')
  return `${prefix}?${paramString}`
}

/**
 * Clear all caches (useful after admin updates)
 */
export function clearAllServerCaches(): void {
  articlesCache.clear()
  entitiesCache.clear()
  categoriesCache.clear()
}
