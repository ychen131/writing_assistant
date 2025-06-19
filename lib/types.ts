export interface Document {
  id: string
  user_id: string
  title: string
  plain_text_content: string // Primary source of truth
  content?: unknown // Legacy JSON state (optional for backward compatibility)
  created_at: string
  updated_at: string
  last_opened_at: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  plain_text_content: string // Primary source of truth
  content?: unknown // Legacy JSON state (optional for backward compatibility)
  title?: string
  created_at: string
  user_id: string
  description?: string
  is_pinned: boolean
  is_auto_save: boolean
}

export interface Profile {
  id: string
  display_name?: string
  created_at: string
  updated_at: string
}

export interface Suggestion {
  id: string
  document_id: string
  type: "grammar" | "spelling" | "style"
  original_text: string
  suggested_text: string
  start_index: number
  end_index: number
  status: "pending" | "accepted" | "ignored"
  message?: string
  created_at: string
}

export interface AISuggestion {
  id: number
  type: 'grammar' | 'spelling' | 'style'
  original_text: string
  suggested_text: string
  start_index: number
  end_index: number
  message: string
  status: 'proposed' | 'accepted' | 'ignored'
}

export interface SuggestionCacheEntry {
  id: string
  document_id: string
  text_hash: string
  text_content: string
  suggestions: AISuggestion[]
  version: string
  created_at: string
  last_used_at: string
  expires_at: string
}

export interface CacheResult {
  hit: boolean
  suggestions: AISuggestion[]
  fromCache: boolean
  version?: string
}
