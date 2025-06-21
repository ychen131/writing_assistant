/**
 * API Route: /api/engage
 * 
 * This endpoint generates engagement suggestions for content creators to increase audience interaction.
 * Uses OpenAI GPT-4o-mini to generate context-aware engagement suggestions.
 * 
 * Request: POST with JSON body containing user's text
 * Response: JSON object with array of engagement suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * Engagement suggestion types
 */
type EngagementSuggestionType = 'Question' | 'Call to Action' | 'Interactive Prompt';

/**
 * Engagement suggestion interface
 */
interface EngagementSuggestion {
  type: EngagementSuggestionType;
  content: string;
}

/**
 * API response interface
 */
interface EngagementResponse {
  suggestions: EngagementSuggestion[];
}

/**
 * AI prompt for generating engagement suggestions
 */
function getEngagementPrompt(userText: string): string {
  return `**Role:**
You are an expert social media strategist and community manager. Your specialty is helping content creators write engaging posts that spark conversations and build community.

**Task:**
Based on the user's text provided below, you will generate three distinct, context-aware suggestions: one open-ended question, one call to action (CTA), and one interactive prompt (like a poll or fill-in-the-blank).

**User's Text:**
${userText}

**Constraints:**
* You must generate exactly one of each of the three types.
* The suggestions must be directly inspired by the content of the user's text.
* The tone of the suggestions should be friendly, curious, and inviting.
* You must provide your response in the JSON format specified below.

**Output Format:**
Respond with a valid JSON object. The root object should have a single key, "suggestions," which is an array of three objects. Each object must have a "type" and a "content" key.

\`\`\`json
{
  "suggestions": [
    { "type": "Question", "content": "Your first generated question goes here." },
    { "type": "Call to Action", "content": "Your generated CTA goes here." },
    { "type": "Interactive Prompt", "content": "Your generated poll or fill-in-the-blank idea goes here." }
  ]
}
\`\`\``;
}

/**
 * Clean and parse AI response
 */
function parseAIResponse(analysis: string): EngagementSuggestion[] {
  try {
    // Clean the AI response - remove markdown code blocks if present
    const cleanedAnalysis = analysis.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
    const parsedResponse = JSON.parse(cleanedAnalysis);
    
    // Validate the response structure
    if (!parsedResponse || typeof parsedResponse !== 'object') {
      throw new Error('AI response is not an object');
    }
    
    if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
      throw new Error('AI response does not contain suggestions array');
    }
    
    // Validate each suggestion
    const suggestions = parsedResponse.suggestions.map((suggestion: any, index: number) => {
      if (!suggestion || typeof suggestion !== 'object') {
        throw new Error(`Suggestion ${index} is not an object`);
      }
      
      if (!suggestion.type || !suggestion.content) {
        throw new Error(`Suggestion ${index} missing required fields`);
      }
      
      if (!['Question', 'Call to Action', 'Interactive Prompt'].includes(suggestion.type)) {
        throw new Error(`Suggestion ${index} has invalid type: ${suggestion.type}`);
      }
      
      if (typeof suggestion.content !== 'string' || suggestion.content.trim().length === 0) {
        throw new Error(`Suggestion ${index} has empty or invalid content`);
      }
      
      return {
        type: suggestion.type as EngagementSuggestionType,
        content: suggestion.content.trim()
      };
    });
    
    // Ensure we have exactly 3 suggestions
    if (suggestions.length !== 3) {
      throw new Error(`Expected 3 suggestions, got ${suggestions.length}`);
    }
    
    return suggestions;
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    console.error('Raw AI response:', analysis);
    throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
}

/**
 * POST handler for /api/engage
 * Accepts user's text and returns AI-generated engagement suggestions
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text } = body;

    // Validate that text is provided
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate that text is not empty
    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    console.log('Calling OpenAI API for engagement suggestions');

    // Generate engagement suggestions using OpenAI
    const { text: analysis } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: getEngagementPrompt(text),
      maxTokens: 1000,
    });

    // Parse and validate the AI response
    const suggestions = parseAIResponse(analysis);

    // Return the suggestions
    const response: EngagementResponse = { suggestions };
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error in /api/engage:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Handle AI response parsing errors
    if (error instanceof Error && error.message.includes('Failed to parse AI response')) {
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 