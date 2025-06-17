import { createHash } from "crypto"

/**
 * Generate a SHA-256 hash of the text content
 */
export function generateTextHash(text: string): string {
  return createHash("sha256").update(text.trim()).digest("hex")
}

/**
 * Check if text content is valid for caching
 */
export function isValidForCaching(text: string): boolean {
  // Only cache text that's at least 10 characters and not too long
  return text.trim().length >= 10 && text.length <= 50000
}

/**
 * Clean and normalize text for consistent hashing
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .toLowerCase()
}

/**
 * Check if cache entry is expired
 */
export function isCacheExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

/**
 * Calculate cache expiration date (default: 7 days)
 */
export function getCacheExpirationDate(days = 7): Date {
  const expiration = new Date()
  expiration.setDate(expiration.getDate() + days)
  return expiration
}

/**
 * Generate cache key for browser storage (fallback)
 */
export function generateCacheKey(documentId: string, textHash: string): string {
  return `suggestion_cache_${documentId}_${textHash}`
}
