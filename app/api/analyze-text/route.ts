import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { serverCacheManager } from "@/lib/cache/suggestion-cache"
import { type AISuggestion } from "@/lib/types"

const CACHE_VERSION = "1.0.0" // Update this when AI model or prompt changes

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, documentId } = await request.json()

    if (!text || text.length < 10) {
      return NextResponse.json({ suggestions: [] })
    }
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Check cache first
    const cacheResult = await serverCacheManager.getCachedSuggestions(documentId, text)
    if (cacheResult.hit && cacheResult.version === CACHE_VERSION) {
      console.log("Cache hit for document:", documentId)
      return NextResponse.json({
        suggestions: cacheResult.suggestions,
        fromCache: true,
        cacheHit: true,
        version: cacheResult.version
      })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured")
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 })
    }

    console.log("Cache miss or version mismatch, calling OpenAI API for document:", documentId)

    // Use OpenAI GPT-4o-mini to analyze the text
    const { text: analysis } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Analyze the following text for writing issues. Return your response as a JSON array of suggestions. Each suggestion should have the following structure:\n{\n  \"type\": \"grammar\" | \"spelling\" | \"style\" | \"accuracy\",\n  \"original_text\": \"the text that needs correction\",\n  \"suggested_text\": \"the corrected text\",\n  \"start_index\": number (character position where the issue starts),\n  \"end_index\": number (character position where the issue ends),\n  \"message\": \"explanation of the issue and why the suggestion improves it\"\n}\n\nTypes:\n- spelling: Misspelled words, typos\n- grammar: Verb conjugation, subject-verb agreement, punctuation, word form\n- style: Wordiness, redundancy, conciseness, ambiguity, repetitive vocabulary, passive voice, vague language, tone issues\n- accuracy: Factual inaccuracies, such as misspelled names of famous people (e.g., "Tim Apple" instead of "Tim Cook", "Nicky Minaj" instead of "Nicki Minaj") or well-known landmarks.\n\nOnly return the JSON array, no other text. If no issues are found, return an empty array [].\n\nText to analyze:\n${text}`,
    })

    console.log("Raw response from OpenAI:", analysis)

    let suggestions: AISuggestion[] = []
    try {
      // The AI can sometimes return the JSON wrapped in ```json ... ```, so we clean it
      const cleanedAnalysis = analysis.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
      const parsedSuggestions = JSON.parse(cleanedAnalysis)
      if (!Array.isArray(parsedSuggestions)) {
        throw new Error("AI response is not an array")
      }
      console.log("text: ", text)
      // Fix indices for each suggestion and filter out those that cannot be matched
      const mappedSuggestions = parsedSuggestions
        .map((sugg: Omit<AISuggestion, 'id' | 'status'>) => {
          if (typeof sugg.original_text === 'string' && sugg.original_text.length > 0) {
            // Find the first occurrence of the original_text in the input text
            const idx = text.indexOf(sugg.original_text)
            if (idx !== -1) {
              // Validate that the indices match the actual text
              const actualText = text.substring(idx, idx + sugg.original_text.length)
              if (actualText === sugg.original_text) {
                return {
                  ...sugg,
                  start_index: idx,
                  end_index: idx + sugg.original_text.length,
                  id: Math.random(), // Generate a temporary ID
                  status: 'proposed' as const
                } as AISuggestion
              }
            }
          }
          console.warn("Suggestion cannot be matched: ", {
            suggestion: sugg,
            original_text: sugg.original_text,
            text_sample: text.substring(Math.max(0, sugg.start_index - 10), Math.min(text.length, sugg.end_index + 10)),
            index: text.indexOf(sugg.original_text)
          })
          return null
        })
        .filter((sugg): sugg is AISuggestion => sugg !== null)
      
      suggestions = mappedSuggestions
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({ 
        error: "Failed to parse AI response",
        details: parseError instanceof Error ? parseError.message : "Unknown error"
      }, { status: 500 })
    }

    // Cache the suggestions for future use
    if (suggestions.length > 0) {
      try {
        const cacheSuccess = await serverCacheManager.cacheSuggestions(
          documentId, 
          text, 
          suggestions,
          CACHE_VERSION
        )
        console.log("Cache save result:", cacheSuccess ? "success" : "failed")
      } catch (cacheError) {
        console.error("Error caching suggestions:", cacheError)
        // Continue execution even if caching fails
      }
    }
  
    return NextResponse.json({
      suggestions,
      fromCache: false,
      cacheHit: false,
      version: CACHE_VERSION
    })
  } catch (error) {
    console.error("Error analyzing text:", error)
    return NextResponse.json({ 
      error: "Failed to analyze text",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
