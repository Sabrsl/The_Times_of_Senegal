'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ViewTrackerProps {
  articleId: string
}

export function ViewTracker({ articleId }: ViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      const storageKey = `viewed_${articleId}`
      const ipCacheKey = 'user_ip_address'

      // Check cookie first (most reliable)
      const hasViewedCookie = document.cookie.includes(`${storageKey}=true`)

      // Also check localStorage as backup
      const hasViewedStorage = localStorage.getItem(storageKey) === 'true'

      if (hasViewedCookie || hasViewedStorage) {
        return // Already counted this view - no request made
      }

      try {
        const supabase = createClient()

        // Try the new RPC function first
        try {
          // Get IP address from cache or fetch from API
          let ipAddress: string = localStorage.getItem(ipCacheKey) || 'unknown'
          const ipTimestamp = localStorage.getItem(`${ipCacheKey}_timestamp`)
          const now = Date.now()

          // Check if IP cache is expired (1 hour)
          if (ipTimestamp && (now - parseInt(ipTimestamp)) < 60 * 60 * 1000) {
            // Use cached IP
          } else {
            // Fetch new IP
            const ipResponse = await fetch('https://api.ipify.org?format=json')
            const ipData = await ipResponse.json()
            ipAddress = ipData.ip || 'unknown'
            // Cache IP with timestamp
            localStorage.setItem(ipCacheKey, ipAddress)
            localStorage.setItem(`${ipCacheKey}_timestamp`, now.toString())
          }

          const { error } = await supabase.rpc('increment_article_view', {
            article_id_param: articleId,
            ip_param: ipAddress
          })

          if (!error) {
            // Set cookie to prevent counting again (expires in 24 hours)
            const expires = new Date()
            expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000)
            document.cookie = `${storageKey}=true; expires=${expires.toUTCString()}; path=/`

            // Also set localStorage as backup
            localStorage.setItem(storageKey, 'true')
            return
          }
        } catch (rpcError) {
          // RPC failed, try fallback
        }

        // Fallback: Simple increment without deduplication
        const { data: article } = await supabase
          .from('articles')
          .select('view_count')
          .eq('id', articleId)
          .single()

        if (article) {
          const currentCount = article.view_count || 0
          await supabase
            .from('articles')
            .update({ view_count: currentCount + 1 })
            .eq('id', articleId)

          // Set both cookie and localStorage
          const expires = new Date()
          expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000)
          document.cookie = `${storageKey}=true; expires=${expires.toUTCString()}; path=/`
          localStorage.setItem(storageKey, 'true')
        }
      } catch (error) {
        // Silently fail if everything fails
        console.error('View tracking error:', error)
      }
    }

    trackView()
  }, [articleId])

  return null // This component doesn't render anything
}
