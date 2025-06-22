import { useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import type { AISuggestion } from "@/lib/types"
import { useSuggestionCache } from "@/hooks/use-suggestion-cache"
import { fuzzyMatch } from "@/lib/utils"

interface UseSuggestionsReturn {
  // Suggestion state
  suggestions: AISuggestion[]
  isAnalyzing: boolean
  selectedSuggestionId: string | null
  
  // Suggestion operations
  setSelectedSuggestionId: (id: string | null) => void
  acceptSuggestion: (id: number, currentText: string) => string
  ignoreSuggestion: (id: number) => void
  addSuggestions: (newSuggestions: AISuggestion[]) => void
  
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

  // Analysis request tracking
  const currentAnalysisRequest = useRef<AbortController | null>(null)
  const pendingAnalysisText = useRef<string>("")
  const analysisTimeoutId = useRef<NodeJS.Timeout | null>(null)
  const isUserTyping = useRef<boolean>(false)
  
  // Unique ID generation
  const nextId = useRef<number>(0)
  
  // Generate unique ID for suggestions
  const generateUniqueId = useCallback(() => {
    return nextId.current++
  }, [])

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

  // Cancel current analysis request
  const cancelCurrentAnalysis = useCallback(() => {
    if (currentAnalysisRequest.current) {
      currentAnalysisRequest.current.abort()
      currentAnalysisRequest.current = null
    }
    if (analysisTimeoutId.current) {
      clearTimeout(analysisTimeoutId.current)
      analysisTimeoutId.current = null
    }
    setIsAnalyzing(false)
  }, [])

  // Analyze text with cancellation support
  const analyzeText = useCallback(async (text: string) => {
    // Cancel any existing analysis
    cancelCurrentAnalysis()

    // Set up new analysis request
    const controller = new AbortController()
    currentAnalysisRequest.current = controller
    pendingAnalysisText.current = text
    setIsAnalyzing(true)

    try {
      console.log("Starting analysis for text:", text.substring(0, 50) + "...")

      // First check cache
      const cacheResult = await getCachedSuggestions(text)

      // Check if request was cancelled while waiting for cache
      if (currentAnalysisRequest.current === null || currentAnalysisRequest.current.signal.aborted) {
        console.log("Analysis cancelled during cache check")
        return
      }

      if (cacheResult.hit) {
        // filter out any suggestions that do not appear in the text
        const filteredSuggestions = cacheResult.suggestions.filter((s: AISuggestion) => {
          if(text.includes(s.original_text)) {
            return true
          } else {
            console.log("suggestion not in text", s)
            return false
          }
        }).map((s: AISuggestion) => ({
          ...s,
          id: generateUniqueId(),
          status: "proposed" as const
        }))
        
        // Merge new suggestions with existing ones instead of replacing
        setSuggestions(prevSuggestions => {
          // Keep existing suggestions that are still valid (not accepted/ignored)
          const existingValidSuggestions = prevSuggestions.filter(s => 
            s.status === "proposed" && text.includes(s.original_text)
          )
          
          // Combine existing valid suggestions with new ones, avoiding duplicates
          const allSuggestions = [...existingValidSuggestions]
          filteredSuggestions.forEach((newSuggestion: AISuggestion) => {
            const isDuplicate = allSuggestions.some(existing => 
              existing.original_text === newSuggestion.original_text && 
              existing.start_index === newSuggestion.start_index &&
              existing.type === newSuggestion.type &&
              existing.suggested_text === newSuggestion.suggested_text
            )
            if (!isDuplicate) {
              allSuggestions.push(newSuggestion)
            }
          })
          
          return allSuggestions
        })
        setLastAnalyzedText(text)
        console.log("Analysis completed from cache")
        return
      }

      // Cache miss - call API
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, documentId }),
        signal: currentAnalysisRequest.current ? currentAnalysisRequest.current.signal : undefined,
      })

      // Check if request was cancelled during API call
      if (currentAnalysisRequest.current === null || currentAnalysisRequest.current.signal.aborted) {
        console.log("Analysis cancelled during API call")
        return
      }

      if (response.ok) {
        const data = await response.json()
        data.suggestions = data.suggestions.map((s: AISuggestion, idx: number) => ({ 
          ...s, 
          id: generateUniqueId(), 
          status: "proposed" as const 
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
        
        // Merge new suggestions with existing ones instead of replacing
        setSuggestions(prevSuggestions => {
          // Keep existing suggestions that are still valid (not accepted/ignored)
          const existingValidSuggestions = prevSuggestions.filter(s => 
            s.status === "proposed" && text.includes(s.original_text)
          )
          
          // Combine existing valid suggestions with new ones, avoiding duplicates
          const allSuggestions = [...existingValidSuggestions]
          filteredSuggestions.forEach((newSuggestion: AISuggestion) => {
            const isDuplicate = allSuggestions.some(existing => 
              existing.original_text === newSuggestion.original_text && 
              existing.start_index === newSuggestion.start_index &&
              existing.type === newSuggestion.type &&
              existing.suggested_text === newSuggestion.suggested_text
            )
            if (!isDuplicate) {
              allSuggestions.push(newSuggestion)
            }
          })
          
          return allSuggestions
        })
        setLastAnalyzedText(text)

        // Cache the new suggestions if they came from API
        if (!data.fromCache && data.suggestions?.length > 0) {
          await cacheSuggestions(text, data.suggestions)
        }
        console.log("Analysis completed from API")
      }
    } catch (error) {
      // Don't log errors for cancelled requests
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Analysis request was cancelled")
      } else {
        console.error("Error analyzing text:", error)
      }
    } finally {
      // Only reset if this is still the current request
      if (currentAnalysisRequest.current && pendingAnalysisText.current === text) {
        currentAnalysisRequest.current = null
        setIsAnalyzing(false)
      }
    }
  }, [getCachedSuggestions, cacheSuggestions, documentId, cancelCurrentAnalysis, generateUniqueId])

  // Trigger analysis when user stops typing (500ms delay)
  const triggerAnalysis = useCallback((text: string) => {
    // Mark that user is actively typing
    isUserTyping.current = true

    // Cancel any pending analysis timeout
    if (analysisTimeoutId.current) {
      clearTimeout(analysisTimeoutId.current)
      analysisTimeoutId.current = null
    }

    // Cancel any in-flight analysis since user is typing again
    if (currentAnalysisRequest.current) {
      console.log("User started typing again, cancelling in-flight analysis")
      currentAnalysisRequest.current.abort()
      currentAnalysisRequest.current = null
      setIsAnalyzing(false)
    }

    // Don't analyze if text is too short
    if (!text || text.length <= 10) {
      return
    }

    // Set the pending text now so we can track changes
    pendingAnalysisText.current = text

    // Schedule analysis to run 500ms after user stops typing
    analysisTimeoutId.current = setTimeout(() => {
      // Mark that user has stopped typing
      isUserTyping.current = false
      
      // Only proceed if this is still the current text
      if (text === pendingAnalysisText.current) {
        console.log("User stopped typing for 500ms, starting analysis")
        analyzeText(text)
      } else {
        console.log("Text changed since timeout was set, skipping analysis")
      }
    }, 500)
  }, [analyzeText])

  // Accept suggestion
  const acceptSuggestion = useCallback((suggestionId: number, currentText: string): string => {
    const suggestion = suggestions.find((s) => s.id === suggestionId)
    if (!suggestion) return currentText

    let newText = currentText;

    // Special, more robust handling for Smart Promo
    if (suggestion.type === 'smart-promo') {
      newText = suggestion.suggested_text;
      // If it's a smart promo, remove all smart promo suggestions
      setSuggestions(prev => prev.filter(s => s.type !== 'smart-promo'));
    } else {
      // Existing logic for other suggestion types
      const closestMatch = fuzzyMatch(currentText, suggestion.original_text, suggestion.start_index)
      if(closestMatch === -1) {
        console.log("no match found for suggestion", suggestion)
        return currentText
      }
      const beforeText = currentText.substring(0, closestMatch)
      const afterText = currentText.substring(closestMatch + suggestion.original_text.length)
      newText = beforeText + suggestion.suggested_text + afterText
      
      // Mark the current one as accepted
      setSuggestions(prev => prev.map((s) => s.id === suggestionId ? { ...s, status: "accepted" } : s))
    }
    
    setSelectedSuggestionId(null)
    
    return newText
  }, [suggestions])

  // Ignore suggestion
  const ignoreSuggestion = useCallback((suggestionId: number) => {
    setSuggestions(prev => prev.map((s) => s.id === suggestionId ? { ...s, status: "ignored" } : s))
    setSelectedSuggestionId(null)
  }, [])

  // Add new suggestions (for engagement suggestions)
  const addSuggestions = useCallback((newSuggestions: AISuggestion[]) => {
    setSuggestions(prev => {
      const suggestionsWithUniqueIds = newSuggestions.map(s => ({
        ...s,
        id: generateUniqueId(),
        status: "proposed" as const
      }))
      return [...prev, ...suggestionsWithUniqueIds]
    })
  }, [generateUniqueId])

  return {
    suggestions,
    isAnalyzing,
    selectedSuggestionId,
    setSelectedSuggestionId,
    acceptSuggestion,
    ignoreSuggestion,
    addSuggestions,
    triggerAnalysis,
  }
} 