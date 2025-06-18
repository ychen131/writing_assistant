export interface Document {
  id: string
  user_id: string
  title: string
  content: unknown // Lexical JSON state
  created_at: string
  updated_at: string
  last_opened_at: string
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
  type: "grammar" | "spelling" | "style"
  original_text: string
  suggested_text: string
  start_index: number
  end_index: number
  message: string
  status: "proposed" | "accepted" | "ignored"
}

export interface SuggestionCache {
  id: string
  document_id: string
  text_hash: string
  text_content: string
  suggestions: AISuggestion[]
  created_at: string
  expires_at: string
}

export interface CacheResult {
  hit: boolean
  suggestions: AISuggestion[]
  fromCache: boolean
  version?: string
}
