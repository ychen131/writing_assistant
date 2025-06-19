import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Document } from "@/lib/types"
import { useDebounce } from "@/hooks/use-debounce"

interface UseDocumentEditorReturn {
  // Document state
  document: Document | null
  title: string
  textContent: string
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  
  // Document operations
  updateTitle: (title: string) => void
  updateTextContent: (text: string) => void
}

export function useDocumentEditor(): UseDocumentEditorReturn {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const documentId = params.id as string

  // Document state
  const [document, setDocument] = useState<Document | null>(null)
  const [title, setTitle] = useState("")
  const [textContent, setTextContent] = useState("")
  const [lastSavedText, setLastSavedText] = useState("")
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Debounced text for auto-save
  const debouncedTextContent = useDebounce(textContent, 2000)

  // Fetch document
  const fetchDocument = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("id, user_id, title, plain_text_content, created_at, updated_at, last_opened_at")
        .eq("id", documentId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          router.push("/dashboard")
          return
        }
        throw error
      }

      setDocument(data)
      setTitle(data.title)
      setTextContent(data.plain_text_content || "")
      setLastSavedText(data.plain_text_content || "")
    } catch (error) {
      console.error("Error fetching document:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }, [documentId, router, supabase])

  // Save document
  const saveDocument = useCallback(async () => {
    if (!document || isSaving) return
    if (textContent === lastSavedText && title === document.title) {
      return
    }
    
    setIsSaving(true)
    try {
      const updates: Partial<Document> = {}

      if (title !== document.title) {
        updates.title = title
      }

      if (textContent !== lastSavedText) {
        updates.plain_text_content = textContent
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("documents")
          .update(updates)
          .eq("id", documentId)

        if (error) throw error

        setDocument({ ...document, ...updates })
        setLastSaved(new Date())
        setLastSavedText(textContent)
      }
    } catch (error) {
      console.error("Error saving document:", error)
    } finally {
      setIsSaving(false)
    }
  }, [document, isSaving, textContent, lastSavedText, title, supabase, documentId])

  // Update handlers
  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle)
  }, [])

  const updateTextContent = useCallback((newText: string) => {
    setTextContent(newText)
  }, [])

  // Effects
  useEffect(() => {
    if (documentId) {
      fetchDocument()
    }
  }, [documentId, fetchDocument])

  useEffect(() => {
    if (document && debouncedTextContent !== lastSavedText) {
      saveDocument()
    }
  }, [debouncedTextContent, document, saveDocument, lastSavedText])

  return {
    document,
    title,
    textContent,
    isLoading,
    isSaving,
    lastSaved,
    updateTitle,
    updateTextContent,
  }
} 