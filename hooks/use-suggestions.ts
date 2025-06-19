import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import type { AISuggestion } from "@/lib/types"
import { useSuggestionCache } from "@/hooks/use-suggestion-cache"
import { useDebounce } from "@/hooks/use-debounce"

interface UseSuggestionsReturn {
  // Suggestion state
  suggestions: AISuggestion[]
  isAnalyzing: boolean
  selectedSuggestionId: string | null
  isApplyingSuggestions: boolean
  
  // Suggestion operations
  setSuggestions: (suggestions: AISuggestion[]) => void
  setSelectedSuggestionId: (id: string | null) => void
  setIsApplyingSuggestions: (isApplying: boolean) => void
  acceptSuggestion: (index: number, currentText: string) => string
  ignoreSuggestion: (index: number) => void
  
  // Analysis trigger
  triggerAnalysis: (text: string) => void
}

export function useSuggestions(): UseSuggestionsReturn {
  const params = useParams()
  const documentId = params.id as string

  // Suggestion state
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)
  const [isApplyingSuggestions, setIsApplyingSuggestions] = useState(false)
  const [lastAnalyzedText, setLastAnalyzedText] = useState("")

  // Debounced text for analysis
  const debouncedTextContent = useDebounce("", 1000) // Will be set by triggerAnalysis

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

  // Analyze text
  const analyzeText = useCallback(async (text: string) => {
    if (isAnalyzing || text === lastAnalyzedText) return

    setIsAnalyzing(true)
    try {
      // First check cache
      const cacheResult = await getCachedSuggestions(text)

      if (cacheResult.hit) {
        setSuggestions(cacheResult.suggestions)
        setLastAnalyzedText(text)
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
        data.suggestions = data.suggestions.map((s: AISuggestion, idx: number) => ({ 
          ...s, 
          id: idx, 
          status: "proposed" 
        }))
        setSuggestions(data.suggestions || [])
        setLastAnalyzedText(text)

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
  }, [isAnalyzing, lastAnalyzedText, getCachedSuggestions, cacheSuggestions, documentId])

  // Trigger analysis
  const triggerAnalysis = useCallback((text: string) => {
    if (!isApplyingSuggestions && text && text.length > 10 && text !== lastAnalyzedText) {
      analyzeText(text)
    }
  }, [isApplyingSuggestions, lastAnalyzedText, analyzeText])

  // Accept suggestion
  const acceptSuggestion = useCallback((index: number, currentText: string): string => {
    const suggestion = suggestions[index]
    if (!suggestion) return currentText

    // Apply the suggestion to the text content
    const beforeText = currentText.substring(0, suggestion.start_index)
    const afterText = currentText.substring(suggestion.end_index)
    const newText = beforeText + suggestion.suggested_text + afterText
    
    // Mark suggestion as accepted
    setSuggestions(prev => prev.map((s, i) => i === index ? { ...s, status: "accepted" } : s))
    setSelectedSuggestionId(null)
    
    return newText
  }, [suggestions])

  // Ignore suggestion
  const ignoreSuggestion = useCallback((index: number) => {
    setSuggestions(prev => prev.map((s, i) => i === index ? { ...s, status: "ignored" } : s))
    setSelectedSuggestionId(null)
  }, [])

  return {
    suggestions,
    isAnalyzing,
    selectedSuggestionId,
    isApplyingSuggestions,
    setSuggestions,
    setSelectedSuggestionId,
    setIsApplyingSuggestions,
    acceptSuggestion,
    ignoreSuggestion,
    triggerAnalysis,
  }
} 