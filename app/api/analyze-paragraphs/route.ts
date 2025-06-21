import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { serverCacheManager } from "@/lib/cache/suggestion-cache"
import { type AISuggestion } from "@/lib/types"

const CACHE_VERSION = "1.0.0" // Update this when AI model or prompt changes

interface ParagraphData {
  id: string
  text: string
  startOffset: number
}

interface AnalyzeParagraphsRequest {
  paragraphs: ParagraphData[]
  documentId: string
}

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

    const { paragraphs, documentId }: AnalyzeParagraphsRequest = await request.json()

    if (!paragraphs || !Array.isArray(paragraphs) || paragraphs.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured")
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 })
    }

    const allSuggestions: AISuggestion[] = []

    // Process each paragraph individually
    for (const paragraph of paragraphs) {
      if (!paragraph.text || paragraph.text.length < 10) {
        continue // Skip short paragraphs
      }

      // Check cache for this specific paragraph
      const cacheKey = `${documentId}-para-${paragraph.id}`
      const cacheResult = await serverCacheManager.getCachedSuggestions(cacheKey, paragraph.text)
      
      if (cacheResult.hit && cacheResult.version === CACHE_VERSION) {
        console.log("Cache hit for paragraph:", paragraph.id)
        // Adjust suggestion positions to account for paragraph offset
        const adjustedSuggestions = cacheResult.suggestions.map(s => ({
          ...s,
          start_index: s.start_index + paragraph.startOffset,
          end_index: s.end_index + paragraph.startOffset
        }))
        allSuggestions.push(...adjustedSuggestions)
        continue
      }

      console.log("Cache miss for paragraph, calling OpenAI API:", paragraph.id)

      // Use OpenAI GPT-4o-mini to analyze this paragraph
      const { text: analysis } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `Analyze the following paragraph for writing issues. Return your response as a JSON array of suggestions. Each suggestion should have the following structure:\n{\n  \"type\": \"grammar\" | \"spelling\" | \"style\",\n  \"original_text\": \"the text that needs correction\",\n  \"suggested_text\": \"the corrected text\",\n  \"start_index\": number (character position where the issue starts within this paragraph),\n  \"end_index\": number (character position where the issue ends within this paragraph),\n  \"message\": \"explanation of the issue and why the suggestion improves it\"\n}\n\nTypes:\n- spelling: Misspelled words, typos\n- grammar: Verb conjugation, subject-verb agreement, punctuation, word form\n- style: Wordiness, redundancy, conciseness, ambiguity, repetitive vocabulary, passive voice, vague language, tone issues\n\nOnly return the JSON array, no other text. If no issues are found, return an empty array [].\n\nParagraph to analyze:\n${paragraph.text}`,
      })

      try {
        // Clean and parse the AI response
        const cleanedAnalysis = analysis.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
        const parsedSuggestions = JSON.parse(cleanedAnalysis)
        
        if (!Array.isArray(parsedSuggestions)) {
          throw new Error("AI response is not an array")
        }

        // Process and validate suggestions for this paragraph
        const paragraphSuggestions = parsedSuggestions
          .map((sugg: Omit<AISuggestion, 'id' | 'status'>) => {
            if (typeof sugg.original_text === 'string' && sugg.original_text.length > 0) {
              // Find the first occurrence of the original_text in the paragraph
              const idx = paragraph.text.indexOf(sugg.original_text)
              if (idx !== -1) {
                // Validate that the indices match the actual text
                const actualText = paragraph.text.substring(idx, idx + sugg.original_text.length)
                if (actualText === sugg.original_text) {
                  return {
                    ...sugg,
                    start_index: idx + paragraph.startOffset, // Adjust for document position
                    end_index: idx + sugg.original_text.length + paragraph.startOffset,
                    id: Math.random(), // Generate a temporary ID
                    status: 'proposed' as const
                  } as AISuggestion
                }
              }
            }
            console.warn("Suggestion cannot be matched in paragraph:", {
              suggestion: sugg,
              paragraphId: paragraph.id,
              original_text: sugg.original_text,
            })
            return null
          })
          .filter((sugg): sugg is AISuggestion => sugg !== null)

        allSuggestions.push(...paragraphSuggestions)

        // Cache the suggestions for this paragraph (with relative positions)
        if (paragraphSuggestions.length > 0) {
          const relativeSuggestions = paragraphSuggestions.map(s => ({
            ...s,
            start_index: s.start_index - paragraph.startOffset,
            end_index: s.end_index - paragraph.startOffset
          }))
          
          try {
            await serverCacheManager.cacheSuggestions(
              cacheKey,
              paragraph.text,
              relativeSuggestions,
              CACHE_VERSION
            )
          } catch (cacheError) {
            console.error("Error caching paragraph suggestions:", cacheError)
          }
        }

      } catch (parseError) {
        console.error("Error parsing AI response for paragraph:", paragraph.id, parseError)
        // Continue with other paragraphs even if one fails
      }
    }

    return NextResponse.json({
      suggestions: allSuggestions,
      fromCache: false,
      version: CACHE_VERSION
    })
  } catch (error) {
    console.error("Error analyzing paragraphs:", error)
    return NextResponse.json({ 
      error: "Failed to analyze paragraphs",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}