import crypto from 'crypto'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface AnalysisCacheEntry {
  proposal: any
  timestamp: number
}

/**
 * Simple in-memory cache with TTL
 */
class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private ttl: number // in milliseconds

  constructor(ttlMinutes: number = 10) {
    this.ttl = ttlMinutes * 60 * 1000
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > this.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired entries (call periodically)
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * Cache for Supabase entities (people, organizations, places, events, tags, dossiers, aliases)
 * TTL: 10 minutes by default
 */
export const entitiesCache = new MemoryCache<any>(10)

/**
 * Cache for classification analysis results
 * Key: classification:{article_id}:{content_hash}
 * TTL: 1 hour (results are valid as long as content doesn't change)
 */
export const analysisCache = new MemoryCache<AnalysisCacheEntry>(60)

/**
 * Generate content hash for article
 * Used as cache key for analysis results
 */
export function generateContentHash(title: string, excerpt: string, content: string): string {
  const text = `${title}|||${excerpt}|||${content}`
  return crypto.createHash('sha256').update(text).digest('hex')
}

/**
 * Get cached analysis result
 * Key format: classification:{article_id}:{content_hash}
 */
export function getCachedAnalysis(articleId: string, contentHash: string): any | null {
  const cacheKey = `classification:${articleId}:${contentHash}`
  const entry = analysisCache.get(cacheKey)
  return entry?.proposal || null
}

/**
 * Cache analysis result
 * Key format: classification:{article_id}:{content_hash}
 */
export function setCachedAnalysis(articleId: string, contentHash: string, proposal: any): void {
  const cacheKey = `classification:${articleId}:${contentHash}`
  analysisCache.set(cacheKey, {
    proposal,
    timestamp: Date.now(),
  })
}

/**
 * Get cached entities for a specific type
 * Key format: entities:{type} (e.g., entities:people, entities:organizations)
 */
export function getCachedEntitiesByType(type: string): any | null {
  const cacheKey = `entities:${type}`
  return entitiesCache.get(cacheKey)
}

/**
 * Cache entities for a specific type
 * Key format: entities:{type} (e.g., entities:people, entities:organizations)
 */
export function setCachedEntitiesByType(type: string, data: any): void {
  const cacheKey = `entities:${type}`
  entitiesCache.set(cacheKey, data)
}

/**
 * Get all cached entities (legacy support)
 */
export function getCachedEntities(): any | null {
  return entitiesCache.get('all_entities')
}

/**
 * Cache all entities (legacy support)
 */
export function setCachedEntities(entities: any): void {
  entitiesCache.set('all_entities', entities)
}

/**
 * Clear all caches (useful for testing or when entities are modified)
 */
export function clearAllCaches(): void {
  entitiesCache.clear()
  analysisCache.clear()
}

/**
 * Clear only the entities cache (when entities are added/modified)
 */
export function clearEntitiesCache(): void {
  entitiesCache.clear()
}

/**
 * Clear cache for a specific entity type
 * @param type - Entity type (e.g., 'people', 'organizations', 'places', 'events', 'aliases')
 */
export function clearEntityTypeCache(type: string): void {
  const cacheKey = `entities:${type}`
  entitiesCache.set(cacheKey, null) // Force cache miss
}

/**
 * Clear classification cache for a specific article
 * @param articleId - Article ID to clear from cache
 */
export function clearArticleClassificationCache(articleId: string): void {
  // Note: MemoryCache doesn't support pattern-based deletion
  // This would require iterating through keys, which is not efficient
  // For now, we clear the entire analysis cache when needed
  analysisCache.clear()
}
