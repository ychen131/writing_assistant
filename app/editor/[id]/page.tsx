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
import type { EditorState } from "lexical"
import { ArrowLeft, Save, CheckCircle, Zap, Database } from "lucide-react"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"
import { SuggestionsSidebar } from "@/components/editor/suggestions-sidebar"

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState<any>(null)
  const [textContent, setTextContent] = useState("")
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cacheHit, setCacheHit] = useState(false)
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)

  const supabase = createClient()
  const documentId = params.id as string

  // Debounce text content for AI analysis
  const debouncedTextContent = useDebounce(textContent, 1000)
    // Initialize suggestion cache
  const { getCachedSuggestions, cacheSuggestions, clearCache, getCacheStats, isCacheLoading, cacheHitRate } =
  useSuggestionCache({
    documentId,
    onCacheHit: (cachedSuggestions) => {
      console.log("Cache hit! Loaded", cachedSuggestions.length, "suggestions")
      setCacheHit(true)
    },
    onCacheMiss: () => {
      console.log("Cache miss, will call AI API")
      setCacheHit(false)
    },
    onCacheError: (error) => {
      console.error("Cache error:", error)
    },
  })


  useEffect(() => {
    if (documentId) {
      fetchDocument()
    }
  }, [documentId])

  // Auto-save when content or title changes
  useEffect(() => {
    if (document && (content || title !== document.title)) {
      const timer = setTimeout(() => {
        saveDocument()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [content, title, document])

  // Analyze text for suggestions when debounced text changes
  useEffect(() => {
    if (debouncedTextContent && debouncedTextContent.length > 10) {
      analyzeText(debouncedTextContent)
    }
  }, [debouncedTextContent])

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase.from("documents").select("*").eq("id", documentId).single()

      if (error) {
        if (error.code === "PGRST116") {
          router.push("/dashboard")
          return
        }
        throw error
      }

      setDocument(data)
      setTitle(data.title)
      // console.log(data.content)
      setContent(JSON.stringify(data.content))
    } catch (error) {
      console.error("Error fetching document:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const saveDocument = async () => {
    if (!document || isSaving) return

    setIsSaving(true)
    try {
      const updates: Partial<Document> = {}

      if (title !== document.title) {
        updates.title = title
      }

      if (content) {
        updates.content = content
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from("documents").update(updates).eq("id", documentId)

        if (error) throw error

        setDocument({ ...document, ...updates })
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error("Error saving document:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const analyzeText = async (text: string) => {
    if (isAnalyzing) return

    setIsAnalyzing(true)
    setCacheHit(false)

    try {
      // First check cache
      const cacheResult = await getCachedSuggestions(text)

      if (cacheResult.hit) {
        setSuggestions(cacheResult.suggestions)
        setCacheHit(true)
        return
      }

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
  }

  const handleEditorChange = useCallback((editorState: EditorState) => {
    setContent(editorState.toJSON())
  }, [])

  const handleTextChange = useCallback((text: string) => {
    setTextContent(text)
  }, [])

  const handleClearCache = async () => {
    const success = await clearCache()
    if (success) {
      setSuggestions([])
      console.log("Cache cleared successfully")
    }
  }

  const handleAcceptSuggestion = useCallback((suggestion: AISuggestion) => {
    // Update the text content with the suggested text
    const newText = textContent.slice(0, suggestion.start_index) + 
                   suggestion.suggested_text + 
                   textContent.slice(suggestion.end_index);
    
    // Update the text content
    setTextContent(newText);
    
    // Remove the accepted suggestion from the list
    setSuggestions(prev => prev.filter(s => 
      s.start_index !== suggestion.start_index || 
      s.end_index !== suggestion.end_index
    ));
    
    // Clear the selected suggestion
    setSelectedSuggestionId(null);
  }, [textContent]);

  const handleIgnoreSuggestion = useCallback((suggestion: AISuggestion) => {
    // Remove the ignored suggestion from the list
    setSuggestions(prev => prev.filter(s => 
      s.start_index !== suggestion.start_index || 
      s.end_index !== suggestion.end_index
    ));
    
    // Clear the selected suggestion
    setSelectedSuggestionId(null);
  }, []);

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
          {(isAnalyzing || isCacheLoading) && (
              <Badge variant="secondary" className="animate-pulse">
                {isCacheLoading ? "Checking cache..." : "Analyzing..."}
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
          </div>
        </div>
      </div>

      {/* Editor */}
      <main className="container mx-auto flex gap-4 py-4">
        <div className="max-w-4xl mx-auto flex-1">
          <LexicalEditor
            initialContent={content}
            onChange={handleEditorChange}
            onTextChange={handleTextChange}
            suggestions={suggestions}
            onSuggestionClick={setSelectedSuggestionId}
            selectedSuggestionId={selectedSuggestionId}
          />
        </div>
        <SuggestionsSidebar
          suggestions={suggestions}
          selectedId={selectedSuggestionId}
          onSelect={setSelectedSuggestionId}
          onAccept={handleAcceptSuggestion}
          onIgnore={handleIgnoreSuggestion}
        />
      </main>
    </div>
  )
}
