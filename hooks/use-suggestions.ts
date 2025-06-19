import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import type { AISuggestion } from "@/lib/types"
import { useSuggestionCache } from "@/hooks/use-suggestion-cache"

interface UseSuggestionsReturn {
  // Suggestion state
  suggestions: AISuggestion[]
  isAnalyzing: boolean
  selectedSuggestionId: string | null
  
  // Suggestion operations
  setSuggestions: (suggestions: AISuggestion[]) => void
  setSelectedSuggestionId: (id: string | null) => void
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
  const [lastAnalyzedText, setLastAnalyzedText] = useState("")

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
        // filter out any suggestions that do not appear in the text
        const filteredSuggestions = cacheResult.suggestions.filter((s: AISuggestion) => {
          if(text.includes(s.original_text)) {
            return true
          } else {
            console.log("suggestion not in text", s)
            return false
          }
        })
        setSuggestions(filteredSuggestions || [])
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
        // filter out any suggestions that do not appear in the text
        const filteredSuggestions = data.suggestions.filter((s: AISuggestion) => {
          if(text.includes(s.original_text)) {
            return true
          } else {
            console.log("suggestion not in text", s)
            return false
          }
        })
        setSuggestions(filteredSuggestions || [])
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
    if (text && text.length > 10 && text !== lastAnalyzedText) {
      analyzeText(text)
    }
  }, [lastAnalyzedText, analyzeText])

  // Accept suggestion
  const acceptSuggestion = useCallback((index: number, currentText: string): string => {
    const suggestion = suggestions[index]
    if (!suggestion) return currentText

    // fuzzy match and find the closest match to the suggestion
    var matches = []
    for(let i = 0; i < currentText.length; i++) {
      if(currentText.substring(i, i + suggestion.original_text.length) === suggestion.original_text) {
        matches.push(i)
      }
    }
    if(matches.length === 0) {
      // console.log("no matches found for suggestion", suggestion)
      return currentText
    }

    const closestMatch = matches.sort((a, b) => a - b)[0]
    const beforeText = currentText.substring(0, closestMatch)
    const afterText = currentText.substring(closestMatch + suggestion.original_text.length)
    const newText = beforeText + suggestion.suggested_text + afterText

    // console.log("applied suggestion", newText)
    
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
    setSuggestions,
    setSelectedSuggestionId,
    acceptSuggestion,
    ignoreSuggestion,
    triggerAnalysis,
  }
} 