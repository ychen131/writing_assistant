import { useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import type { AISuggestion } from "@/lib/types"
import { useSuggestionCache } from "@/hooks/use-suggestion-cache"
import { fuzzyMatch } from "@/lib/utils"
import { extractParagraphs, detectChangedParagraphs, type ParagraphData } from "@/lib/paragraph-utils"

interface UseSuggestionsReturn {
  // Suggestion state
  suggestions: AISuggestion[]
  isAnalyzing: boolean
  selectedSuggestionId: string | null
  
  // Suggestion operations
  setSelectedSuggestionId: (id: string | null) => void
  acceptSuggestion: (index: number, currentText: string) => string
  ignoreSuggestion: (index: number) => void
  
  // Analysis trigger
  triggerAnalysis: (text: string) => void
  triggerParagraphAnalysis: (text: string) => void
}


export function useSuggestions(): UseSuggestionsReturn {
  const params = useParams()
  const documentId = params.id as string

  // Suggestion state
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)
  const [lastAnalyzedText, setLastAnalyzedText] = useState("")
  
  // Paragraph tracking state
  const lastParagraphsRef = useRef<ParagraphData[]>([])
  const [paragraphSuggestions, setParagraphSuggestions] = useState<Map<string, AISuggestion[]>>(new Map())

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

  // Analyze paragraphs - more efficient approach
  const analyzeParagraphs = useCallback(async (text: string) => {
    if (isAnalyzing || text === lastAnalyzedText) return

    setIsAnalyzing(true)
    try {
      const currentParagraphs = extractParagraphs(text)
      const changedParagraphs = detectChangedParagraphs(lastParagraphsRef.current, currentParagraphs)
      
      if (changedParagraphs.length === 0) {
        setIsAnalyzing(false)
        return // No changes to analyze
      }

      console.log(`Analyzing ${changedParagraphs.length} changed paragraphs out of ${currentParagraphs.length} total`)

      // Call the paragraph analysis API
      const response = await fetch("/api/analyze-paragraphs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          paragraphs: changedParagraphs.map(p => ({
            id: p.id,
            text: p.text,
            startOffset: p.startOffset
          })),
          documentId 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update paragraph suggestions map
        setParagraphSuggestions(prev => {
          const newMap = new Map(prev)
          
          // Remove suggestions for changed paragraphs
          changedParagraphs.forEach(p => newMap.delete(p.id))
          
          // Group new suggestions by paragraph
          const newSuggestionsByParagraph = new Map<string, AISuggestion[]>()
          data.suggestions.forEach((suggestion: AISuggestion) => {
            // Find which paragraph this suggestion belongs to
            const paragraph = currentParagraphs.find(p => 
              suggestion.start_index >= p.startOffset && 
              suggestion.start_index < p.startOffset + p.text.length
            )
            if (paragraph) {
              const existing = newSuggestionsByParagraph.get(paragraph.id) || []
              existing.push(suggestion)
              newSuggestionsByParagraph.set(paragraph.id, existing)
            }
          })
          
          // Add new suggestions to map
          newSuggestionsByParagraph.forEach((suggestions, paragraphId) => {
            newMap.set(paragraphId, suggestions)
          })
          
          return newMap
        })

        // Flatten all paragraph suggestions into main suggestions array
        const allSuggestions: AISuggestion[] = []
        paragraphSuggestions.forEach(suggestions => {
          allSuggestions.push(...suggestions)
        })
        allSuggestions.push(...(data.suggestions || []))

        // Filter suggestions that still appear in current text
        const filteredSuggestions = allSuggestions.filter((s: AISuggestion) => {
          return text.includes(s.original_text)
        })

        setSuggestions(filteredSuggestions)
        setLastAnalyzedText(text)
        lastParagraphsRef.current = currentParagraphs
      }
    } catch (error) {
      console.error("Error analyzing paragraphs:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [isAnalyzing, lastAnalyzedText, documentId, paragraphSuggestions])

  // Trigger analysis
  const triggerAnalysis = useCallback((text: string) => {
    if (text && text.length > 10 && text !== lastAnalyzedText) {
      analyzeText(text)
    }
  }, [lastAnalyzedText, analyzeText])

  // Trigger paragraph analysis (new efficient approach)
  const triggerParagraphAnalysis = useCallback((text: string) => {
    if (text && text.length > 10) {
      analyzeParagraphs(text)
    }
  }, [analyzeParagraphs])

  // Accept suggestion
  const acceptSuggestion = useCallback((index: number, currentText: string): string => {
    const suggestion = suggestions[index]
    if (!suggestion) return currentText


    // const closestMatch = matches.sort((a, b) => Math.abs(a - suggestion.start_index) - Math.abs(b - suggestion.start_index))[0]
    const closestMatch = fuzzyMatch(currentText, suggestion.original_text, suggestion.start_index)
    if(closestMatch === -1) {
      console.log("no match found for suggestion", suggestion)
      return currentText
    }
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
    setSelectedSuggestionId,
    acceptSuggestion,
    ignoreSuggestion,
    triggerAnalysis,
    triggerParagraphAnalysis,
  }
} 