import { createClient } from "@/lib/supabase/client"
import type { AISuggestion, CacheResult } from "@/lib/types"
import {
  generateTextHash,
  isValidForCaching,
  normalizeText,
  isCacheExpired,
  getCacheExpirationDate,
  generateCacheKey,
} from "./cache-utils"

export class SuggestionCacheManager {
  private isServer: boolean

  constructor(isServer = false) {
    this.isServer = isServer
  }

  private getSupabaseClient() {
    return this.isServer ? null : createClient()
  }

  /**
   * Check cache for existing suggestions
   */
  async getCachedSuggestions(documentId: string, textContent: string): Promise<CacheResult> {
    try {
      // Validate text for caching
      if (!isValidForCaching(textContent)) {
        return { hit: false, suggestions: [], fromCache: false }
      }

      const normalizedText = normalizeText(textContent)
      const textHash = generateTextHash(normalizedText)

      // Try database cache first
      const dbResult = await this.getCachedFromDatabase(documentId, textHash)
      if (dbResult.hit) {
        return dbResult
      }

      // Fallback to browser cache (client-side only)
      if (!this.isServer) {
        const browserResult = await this.getCachedFromBrowser(documentId, textHash)
        if (browserResult.hit) {
          return browserResult
        }
      }

      return { hit: false, suggestions: [], fromCache: false }
    } catch (error) {
      console.error("Error getting cached suggestions:", error)
      return { hit: false, suggestions: [], fromCache: false }
    }
  }

  /**
   * Cache suggestions in database
   */
  async cacheSuggestions(
    documentId: string, 
    textContent: string, 
    suggestions: AISuggestion[],
    version?: string
  ): Promise<boolean> {
    try {
      if (!isValidForCaching(textContent) || suggestions.length === 0) {
        return false
      }

      const normalizedText = normalizeText(textContent)
      const textHash = generateTextHash(normalizedText)

      // Cache in database
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');
      const response = await fetch(`${baseUrl}/api/db`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveSuggestions",
          params: {
            documentId,
            textHash,
            textContent,
            suggestions,
            version
          }
        })
      })

      const { success } = await response.json()
      if (!success) return false

      // Also cache in browser (client-side only)
      if (!this.isServer) {
        await this.cacheInBrowser(documentId, textHash, suggestions, getCacheExpirationDate(), version)
      }

      return true
    } catch (error) {
      console.error("Error caching suggestions:", error)
      return false
    }
  }

  /**
   * Get cached suggestions from database
   */
  private async getCachedFromDatabase(documentId: string, textHash: string): Promise<CacheResult> {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');
      const response = await fetch(`${baseUrl}/api/db`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCachedSuggestions",
          params: { documentId, textHash }
        })
      })

      const { success, data } = await response.json()
      
      if (!success || !data) {
        return { hit: false, suggestions: [], fromCache: false }
      }

      // Check if cache is expired
      if (isCacheExpired(data.expires_at)) {
        // Clean up expired cache
        await this.deleteCacheEntry(data.id)
        return { hit: false, suggestions: [], fromCache: false }
      }

      return {
        hit: true,
        suggestions: data.suggestions,
        fromCache: true,
        version: data.version
      }
    } catch (error) {
      console.error("Error getting database cache:", error)
      return { hit: false, suggestions: [], fromCache: false }
    }
  }

  /**
   * Get cached suggestions from browser storage
   */
  private async getCachedFromBrowser(documentId: string, textHash: string): Promise<CacheResult> {
    try {
      if (typeof window === "undefined") {
        return { hit: false, suggestions: [], fromCache: false }
      }

      const cacheKey = generateCacheKey(documentId, textHash)
      const cached = localStorage.getItem(cacheKey)

      if (!cached) {
        return { hit: false, suggestions: [], fromCache: false }
      }

      const parsedCache = JSON.parse(cached)

      // Check if cache is expired
      if (isCacheExpired(parsedCache.expiresAt)) {
        localStorage.removeItem(cacheKey)
        return { hit: false, suggestions: [], fromCache: false }
      }

      return {
        hit: true,
        suggestions: parsedCache.suggestions,
        fromCache: true,
        version: parsedCache.version
      }
    } catch (error) {
      console.error("Error getting browser cache:", error)
      return { hit: false, suggestions: [], fromCache: false }
    }
  }

  /**
   * Cache suggestions in browser storage
   */
  private async cacheInBrowser(
    documentId: string,
    textHash: string,
    suggestions: AISuggestion[],
    expiresAt: Date,
    version?: string
  ): Promise<void> {
    try {
      if (typeof window === "undefined") return

      const cacheKey = generateCacheKey(documentId, textHash)
      const cacheData = {
        suggestions,
        expiresAt: expiresAt.toISOString(),
        cachedAt: new Date().toISOString(),
        version
      }

      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error("Error caching in browser:", error)
    }
  }

  /**
   * Delete a specific cache entry
   */
  private async deleteCacheEntry(cacheId: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient()
      if (supabase) {
        await supabase.from("suggestion_cache").delete().eq("id", cacheId)
      }
    } catch (error) {
      console.error("Error deleting cache entry:", error)
    }
  }

  /**
   * Clear all cache for a document
   */
  async clearDocumentCache(documentId: string): Promise<boolean> {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');
      const response = await fetch(`${baseUrl}/api/db`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clearCache",
          params: { documentId }
        })
      })

      const { success } = await response.json()

      // Also clear browser cache
      if (!this.isServer && typeof window !== "undefined") {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith(`suggestion_cache_${documentId}_`)) {
            localStorage.removeItem(key)
          }
        })
      }

      return success
    } catch (error) {
      console.error("Error clearing document cache:", error)
      return false
    }
  }

  /**
   * Get cache statistics for a document
   */
  async getCacheStats(documentId: string) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');
      const response = await fetch(`${baseUrl}/api/db`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCacheStats",
          params: { documentId }
        })
      })

      const { success, stats } = await response.json()
      return success ? stats : { totalEntries: 0, totalSize: 0, oldestEntry: null, newestEntry: null }
    } catch (error) {
      console.error("Error getting cache stats:", error)
      return { totalEntries: 0, totalSize: 0, oldestEntry: null, newestEntry: null }
    }
  }
}

// Export singleton instances
export const clientCacheManager = new SuggestionCacheManager(false)
export const serverCacheManager = new SuggestionCacheManager(true)
