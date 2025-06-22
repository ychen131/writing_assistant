/**
 * Smart Promo API Route
 * 
 * Handles POST requests to generate strategic promotional suggestions.
 * Uses OpenAI's GPT-4o-mini model for AI-powered text transformation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

/**
 * Strategy types for promotional suggestions
 */
type PromoStrategy = 'Focus on Storytelling' | 'Focus on a Relatable Problem' | 'Focus on Transformation'

/**
 * Individual promotional suggestion structure
 */
interface PromoSuggestion {
  strategy: PromoStrategy
  rewrittenText: string
  explanation: string
}

/**
 * Request body structure for promo API
 */
interface PromoRequest {
  text: string
}

/**
 * Response structure for promo API
 */
interface PromoResponse {
  suggestions: PromoSuggestion[]
}

/**
 * AI prompt for generating strategic promotional suggestions
 */
function getSmartPromoPrompt(userText: string): string {
  return `**Role:**
You are an expert content marketing strategist who specializes in helping creators talk about products in an authentic, natural way. Your goal is to rewrite pushy, ad-like text into compelling, trust-building recommendations.

**Task:**
Analyze the user's promotional text provided below. Rewrite it in three different, more authentic ways, each based on a distinct marketing strategy. For each rewritten version, you must also provide a short, educational explanation of the strategy you used.

**User's Text:**
${userText}

**Strategies to Use:**
1.  **Focus on Storytelling:** Rewrite the text by telling a personal story about using the product and the benefit it provided.
2.  **Focus on a Relatable Problem:** Rewrite the text by highlighting a common, relatable problem that the product solves.
3.  **Focus on Transformation:** Rewrite the text to focus on the aspirational outcome or the better lifestyle the product helps the user achieve.

**Constraints:**
* Do not invent product features that don't exist in the original text.
* The explanations should be concise (1-2 sentences) and focused on *why* the strategy is effective.

**Output Format:**
Respond with a valid JSON object. The root object should have a single key, "suggestions," which is an array of exactly three objects. Each object must have the keys "strategy", "rewrittenText", and "explanation".

\`\`\`json
{
  "suggestions": [
    {
      "strategy": "Focus on Storytelling",
      "rewrittenText": "Your rewritten version based on the storytelling strategy.",
      "explanation": "Your explanation of why the storytelling approach is effective."
    },
    {
      "strategy": "Focus on a Relatable Problem",
      "rewrittenText": "Your rewritten version based on the relatable problem strategy.",
      "explanation": "Your explanation of why the relatable problem approach is effective."
    },
    {
      "strategy": "Focus on Transformation",
      "rewrittenText": "Your rewritten version based on the transformation strategy.",
      "explanation": "Your explanation of why the transformation approach is effective."
    }
  ]
}
\`\`\``
}

/**
 * Clean and parse AI response
 */
function parseAIResponse(analysis: string): PromoSuggestion[] {
  try {
    // Clean the AI response - remove markdown code blocks if present
    const cleanedAnalysis = analysis.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
    const parsedResponse = JSON.parse(cleanedAnalysis)
    
    // Validate the response structure
    if (!parsedResponse || typeof parsedResponse !== 'object') {
      throw new Error('AI response is not an object')
    }
    
    if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
      throw new Error('AI response does not contain suggestions array')
    }
    
    // Validate each suggestion
    const suggestions = parsedResponse.suggestions.map((suggestion: any, index: number) => {
      if (!suggestion || typeof suggestion !== 'object') {
        throw new Error(`Suggestion ${index} is not an object`)
      }
      
      if (!suggestion.strategy || !suggestion.rewrittenText || !suggestion.explanation) {
        throw new Error(`Suggestion ${index} missing required fields`)
      }
      
      if (!['Focus on Storytelling', 'Focus on a Relatable Problem', 'Focus on Transformation'].includes(suggestion.strategy)) {
        throw new Error(`Suggestion ${index} has invalid strategy: ${suggestion.strategy}`)
      }
      
      if (typeof suggestion.rewrittenText !== 'string' || suggestion.rewrittenText.trim().length === 0) {
        throw new Error(`Suggestion ${index} has empty or invalid rewrittenText`)
      }
      
      if (typeof suggestion.explanation !== 'string' || suggestion.explanation.trim().length === 0) {
        throw new Error(`Suggestion ${index} has empty or invalid explanation`)
      }
      
      return {
        strategy: suggestion.strategy as PromoStrategy,
        rewrittenText: suggestion.rewrittenText.trim(),
        explanation: suggestion.explanation.trim()
      }
    })
    
    // Ensure we have exactly 3 suggestions
    if (suggestions.length !== 3) {
      throw new Error(`Expected 3 suggestions, got ${suggestions.length}`)
    }
    
    return suggestions
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError)
    console.error('Raw AI response:', analysis)
    throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
  }
}

/**
 * POST handler for smart promo text rewriting
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: PromoRequest = await request.json()
    const { text } = body

    // Validate required fields
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text field is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate that text is not empty
    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    console.log('Calling OpenAI API for Smart Promo suggestions')

    // Generate AI prompt based on user text
    const prompt = getSmartPromoPrompt(text)

    try {
      // Use OpenAI GPT-4o-mini to generate suggestions
      const { text: analysis } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt,
        maxTokens: 1000,
      })

      // Parse and validate the AI response
      const suggestions = parseAIResponse(analysis)

      // Return the suggestions
      const response: PromoResponse = { suggestions }
      console.log('Successfully generated Smart Promo suggestions')
      return NextResponse.json(response, { status: 200 })

    } catch (aiError) {
      console.error('AI service error:', aiError)
      return NextResponse.json(
        { error: 'Failed to generate promotional suggestions' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Smart Promo API error:', error)
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Handle AI response parsing errors
    if (error instanceof Error && error.message.includes('Failed to parse AI response')) {
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          details: error.message
        },
        { status: 500 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 