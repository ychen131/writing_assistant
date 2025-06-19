"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Document, AISuggestion } from "@/lib/types"
import { LexicalEditor } from "@/components/editor/lexical-editor"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSuggestionCache } from "@/hooks/use-suggestion-cache"
import { type EditorState } from "lexical"
import { ArrowLeft, Save, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"
import { SuggestionsSidebar } from "@/components/editor/suggestions-sidebar"
import { VersionHistoryModal } from "@/components/editor/version-history-modal"
import { useDocumentVersions } from "@/hooks/use-document-versions"

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [lastSavedText, setLastSavedText] = useState<string>("")
  const [title, setTitle] = useState("")
  const [textContent, setTextContent] = useState("")
  const [lastAnalyzedText, setLastAnalyzedText] = useState("")
  const [isApplyingSuggestions, setIsApplyingSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)
  const [lastVersionSave, setLastVersionSave] = useState<string>("")

  const supabase = createClient()
  const documentId = params.id as string

  // Debounce text content for AI analysis
  const debouncedTextContent = useDebounce(textContent, 1000)
  // Debounce content for version creation (5 minutes)
  const debouncedContentForVersion = useDebounce(textContent, 300000)
  
  // Initialize suggestion cache
  const { getCachedSuggestions, cacheSuggestions } = useSuggestionCache({
    documentId,
    onCacheHit: (cachedSuggestions) => {
      console.log("Cache hit! Loaded", cachedSuggestions.length, "suggestions")
    },
    onCacheMiss: () => {
      console.log("Cache miss, will call AI API")
    },
    onCacheError: (error) => {
      console.error("Cache error:", error)
    },
  })

  // Initialize version management
  const { createVersion } = useDocumentVersions({
    documentId,
    onVersionCreate: () => {
      console.log("Version created successfully")
    },
    onVersionRestore: (restoredText) => {
      setTextContent(restoredText)
      setLastVersionSave(restoredText)
    }
  })

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

  const saveDocument = useCallback(async () => {
    if (!document || isSaving) return
    if (textContent === lastSavedText) {
      return
    }
    setIsSaving(true)
    try {
      const updates: Partial<Document> = {}

      if (title !== document.title) {
        updates.title = title
      }

      if (textContent !== lastSavedText) {
        console.log("saving text content:", textContent)
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

  const analyzeText = useCallback(async (text: string) => {
    if (isAnalyzing) return

    setIsAnalyzing(true)
    try {
      // First check cache
      const cacheResult = await getCachedSuggestions(text)

      if (cacheResult.hit) {
        setSuggestions(cacheResult.suggestions)
        return
      }
      console.log("text: ", text)
      // Cache miss - call API
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, documentId }),
      })

      if (response.ok) {
        const data = await response.json()
        data.suggestions = data.suggestions.map((s: AISuggestion, idx: number) => ({ ...s, id: idx, status: "proposed" }))
        console.log("data.suggestions", data.suggestions)
        setSuggestions(data.suggestions || [])

        // Cache the new suggestions if they came from API
        if (!data.fromCache && data.suggestions?.length > 0) {
          await cacheSuggestions(text, data.suggestions)
        }
      }
    } catch (error) {
      console.error("Error analyzing text:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [isAnalyzing, getCachedSuggestions, cacheSuggestions, documentId])

  useEffect(() => {
    if (documentId) {
      fetchDocument()
    }
  }, [documentId, fetchDocument])

  useEffect(() => {
    if (document && (textContent !== lastSavedText || title !== document.title)) {
      const timer = setTimeout(() => {
        saveDocument()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [textContent, title, document, saveDocument, lastSavedText])

  useEffect(() => {
    if (!isApplyingSuggestions && debouncedTextContent && debouncedTextContent.length > 10 && debouncedTextContent !== lastAnalyzedText) {
      analyzeText(debouncedTextContent)
    }
    setLastAnalyzedText(debouncedTextContent)
  }, [debouncedTextContent, lastAnalyzedText, isApplyingSuggestions, analyzeText])

  // Auto-save versions every 5 minutes
  useEffect(() => {
    if (debouncedContentForVersion && 
        debouncedContentForVersion !== lastVersionSave && 
        document) {
      // Create auto-save version using the hook
      createVersion(debouncedContentForVersion, false, 'Auto-saved version')
      setLastVersionSave(debouncedContentForVersion)
    }
  }, [debouncedContentForVersion, lastVersionSave, document, createVersion])

  const handleTextChange = useCallback((text: string) => {
    setTextContent(text)
  }, [])

  const handleAcceptSuggestion = useCallback((index: number) => {
    const suggestion = suggestions[index]
    if (!suggestion) return

    // Apply the suggestion to the text content
    const beforeText = textContent.substring(0, suggestion.start_index)
    const afterText = textContent.substring(suggestion.end_index)
    const newText = beforeText + suggestion.suggested_text + afterText
    
    setTextContent(newText)
    
    // Mark suggestion as accepted
    setSuggestions(prev => prev.map((s, i) => i === index ? { ...s, status: "accepted" } : s))
    setSelectedSuggestionId(null)
  }, [suggestions, textContent])

  const handleIgnoreSuggestion = useCallback((index: number) => {
    // Mark the suggestion as ignored
    setSuggestions(prev => prev.map((s, i) => i === index ? { ...s, status: "ignored" } : s))
    
    // Clear the selected suggestion
    setSelectedSuggestionId(null)
  }, [])

  const handleVersionRestore = useCallback((restoredText: string) => {
    setTextContent(restoredText)
    setLastVersionSave(restoredText)
  }, [])

  const handleVersionCreate = useCallback(() => {
    // Refresh the document to show updated version count
    fetchDocument()
  }, [fetchDocument])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Document Header */}
      <div className="border-b bg-gray-50 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documents
              </Button>
            </Link>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0"
              placeholder="Document title..."
            />
          </div>

          <div className="flex items-center gap-3">
            {isAnalyzing && (
              <Badge variant="secondary" className="animate-pulse">
                Analyzing...
              </Badge>
            )}

            {suggestions.length > 0 && (
              <Badge variant="outline">
                {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}
              </Badge>
            )}

            {isSaving ? (
              <Badge variant="secondary">
                <Save className="h-3 w-3 mr-1 animate-spin" />
                Saving...
              </Badge>
            ) : lastSaved ? (
              <Badge variant="outline">
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            ) : null}

            <VersionHistoryModal
              documentId={documentId}
              documentTitle={title || "Untitled Document"}
              currentContent={textContent}
              onRestore={handleVersionRestore}
              onVersionCreate={handleVersionCreate}
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <main className="container mx-auto flex gap-4 py-4">
        <div className="max-w-4xl mx-auto flex-1">
          <LexicalEditor
            onTextChange={handleTextChange}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            setApplyingSuggestions={setIsApplyingSuggestions}
            onSuggestionClick={setSelectedSuggestionId}
            selectedSuggestionId={selectedSuggestionId}
            initialText={textContent}
          />
        </div>
        <SuggestionsSidebar
          suggestions={suggestions}
          selectedId={selectedSuggestionId}
          onAccept={handleAcceptSuggestion}
          onIgnore={handleIgnoreSuggestion}
        />
      </main>
    </div>
  )
}
