/**
 * Persona API Route
 * 
 * Handles POST requests to rewrite text using different creative personas.
 * Uses OpenAI's GPT-4o-mini model for AI-powered text transformation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

/**
 * Valid persona types that can be applied to text
 */
const VALID_PERSONAS = ['Humorous', 'Vivid', 'To the point'] as const

/**
 * Type for valid persona values
 */
type PersonaType = typeof VALID_PERSONAS[number]

/**
 * Request body structure for persona API
 */
interface PersonaRequest {
  text: string
  persona: string
}

/**
 * Response structure for persona API
 */
interface PersonaResponse {
  rewrittenText: string
}

/**
 * Generates AI prompt based on the selected persona
 */
function generatePersonaPrompt(text: string, persona: PersonaType): string {
  const basePrompt = `You are an expert editor. Rewrite the following text according to the specified style. Do not add commentary or explanations - only return the rewritten text.

Original text: "${text}"

Style requirement: `

  switch (persona) {
    case 'Humorous':
      return basePrompt + `Make this text witty and humorous while maintaining the core message.`
    case 'Vivid':
      return basePrompt + `Make this text more descriptive and vivid, using strong sensory details to paint a picture.`
    case 'To the point':
      return basePrompt + `Make this text as clear and concise as possible, removing any unnecessary words.`
    default:
      throw new Error(`Unknown persona: ${persona}`)
  }
}

/**
 * POST handler for persona text rewriting
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: PersonaRequest = await request.json()
    const { text, persona } = body

    // Validate required fields
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text field is required and must be a string' },
        { status: 400 }
      )
    }

    if (!persona || typeof persona !== 'string') {
      return NextResponse.json(
        { error: 'Persona field is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate persona type
    if (!VALID_PERSONAS.includes(persona as PersonaType)) {
      return NextResponse.json(
        { 
          error: `Invalid persona. Must be one of: ${VALID_PERSONAS.join(', ')}` 
        },
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

    console.log(`Generating ${persona} persona for text:`, text.substring(0, 100) + '...')

    // Generate AI prompt based on persona
    const prompt = generatePersonaPrompt(text, persona as PersonaType)

    try {
      // Use OpenAI GPT-4o-mini to rewrite the text
      const { text: rewrittenText } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt,
        temperature: 0.7, // Balanced creativity and consistency
      })

      // Clean up the response (remove any extra whitespace or quotes)
      const cleanedText = rewrittenText.trim().replace(/^["']|["']$/g, '')

      const response: PersonaResponse = {
        rewrittenText: cleanedText
      }

      console.log('Successfully generated persona text')
      return NextResponse.json(response, { status: 200 })

    } catch (aiError) {
      console.error('AI service error:', aiError)
      return NextResponse.json(
        { error: 'Failed to generate rewritten text' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Persona API error:', error)
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 