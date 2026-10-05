import { NextResponse } from 'next/server'
import { clearAllServerCaches, clearServerCacheByType } from '@/lib/supabase/cache'
import { clearEntityTypeCache, clearAllCaches as clearAllClassificationCaches } from '@/lib/classification/cache'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const type = body.type as string | undefined
    const cacheSystem = body.cacheSystem as 'server' | 'classification' | 'both' | undefined

    console.log(`[Cache Invalidation] Clearing cache - type: ${type || 'all'}, system: ${cacheSystem || 'both'}`)

    if (type) {
      // Clear only specific cache type
      if (!cacheSystem || cacheSystem === 'server' || cacheSystem === 'both') {
        clearServerCacheByType(type)
        console.log(`[Cache Invalidation] Server cache cleared for ${type}`)
      }
      if (!cacheSystem || cacheSystem === 'classification' || cacheSystem === 'both') {
        clearEntityTypeCache(type)
        console.log(`[Cache Invalidation] Classification cache cleared for ${type}`)
      }
      return NextResponse.json({ success: true, message: `Cache cleared for ${type}` })
    } else {
      // Clear all caches
      if (!cacheSystem || cacheSystem === 'server' || cacheSystem === 'both') {
        clearAllServerCaches()
        console.log('[Cache Invalidation] All server caches cleared')
      }
      if (!cacheSystem || cacheSystem === 'classification' || cacheSystem === 'both') {
        clearAllClassificationCaches()
        console.log('[Cache Invalidation] All classification caches cleared')
      }
      return NextResponse.json({ success: true, message: 'All caches cleared successfully' })
    }
  } catch (error) {
    console.error('[Cache Invalidation] Error clearing cache:', error)
    return NextResponse.json({ success: false, error: 'Failed to clear cache' }, { status: 500 })
  }
}
