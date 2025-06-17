"use client"

import { useState, useCallback, useRef } from "react"
import { clientCacheManager } from "@/lib/cache/suggestion-cache"
import type { AISuggestion, CacheResult } from "@/lib/types"

interface UseSuggestionCacheOptions {
  documentId: string
  onCacheHit?: (suggestions: AISuggestion[]) => void
  onCacheMiss?: () => void
  onCacheError?: (error: Error) => void
}

interface UseSuggestionCacheReturn {
  getCachedSuggestions: (text: string) => Promise<CacheResult>
  cacheSuggestions: (text: string, suggestions: AISuggestion[]) => Promise<boolean>
  clearCache: () => Promise<boolean>
  getCacheStats: () => Promise<{
    totalEntries: number
    totalSize: number
    oldestEntry: string | null
    newestEntry: string | null
  }>
  isCacheLoading: boolean
  cacheHitRate: number
}

export function useSuggestionCache({
  documentId,
  onCacheHit,
  onCacheMiss,
  onCacheError,
}: UseSuggestionCacheOptions): UseSuggestionCacheReturn {
  const [isCacheLoading, setIsCacheLoading] = useState(false)
  const cacheStatsRef = useRef({ hits: 0, misses: 0 })

  const getCachedSuggestions = useCallback(
    async (text: string): Promise<CacheResult> => {
      setIsCacheLoading(true)

      try {
        const result = await clientCacheManager.getCachedSuggestions(documentId, text)

        if (result.hit) {
          cacheStatsRef.current.hits++
          onCacheHit?.(result.suggestions)
        } else {
          cacheStatsRef.current.misses++
          onCacheMiss?.()
        }

        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Cache error")
        onCacheError?.(err)
        cacheStatsRef.current.misses++
        return { hit: false, suggestions: [], fromCache: false }
      } finally {
        setIsCacheLoading(false)
      }
    },
    [documentId, onCacheHit, onCacheMiss, onCacheError],
  )

  const cacheSuggestions = useCallback(
    async (text: string, suggestions: AISuggestion[]): Promise<boolean> => {
      try {
        return await clientCacheManager.cacheSuggestions(documentId, text, suggestions)
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Cache error")
        onCacheError?.(err)
        return false
      }
    },
    [documentId, onCacheError],
  )

  const clearCache = useCallback(async (): Promise<boolean> => {
    try {
      const success = await clientCacheManager.clearDocumentCache(documentId)
      if (success) {
        // Reset cache stats
        cacheStatsRef.current = { hits: 0, misses: 0 }
      }
      return success
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Cache clear error")
      onCacheError?.(err)
      return false
    }
  }, [documentId, onCacheError])

  const getCacheStats = useCallback(async () => {
    try {
      return await clientCacheManager.getCacheStats(documentId)
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Cache stats error")
      onCacheError?.(err)
      return { totalEntries: 0, totalSize: 0, oldestEntry: null, newestEntry: null }
    }
  }, [documentId, onCacheError])

  const cacheHitRate =
    cacheStatsRef.current.hits + cacheStatsRef.current.misses > 0
      ? (cacheStatsRef.current.hits / (cacheStatsRef.current.hits + cacheStatsRef.current.misses)) * 100
      : 0

  return {
    getCachedSuggestions,
    cacheSuggestions,
    clearCache,
    getCacheStats,
    isCacheLoading,
    cacheHitRate,
  }
}
