/**
 * API Route: /api/engage
 * 
 * This endpoint generates engagement suggestions for content creators to increase audience interaction.
 * Currently implemented as a mock endpoint that returns hardcoded suggestions.
 * 
 * Request: POST with JSON body containing user's text
 * Response: JSON object with array of engagement suggestions
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock engagement suggestions for testing the API contract
 * Returns one example of each required suggestion type
 */
function getMockEngagementSuggestions(): {
  suggestions: Array<{
    type: 'Question' | 'Call to Action' | 'Interactive Prompt';
    content: string;
  }>;
} {
  return {
    suggestions: [
      {
        type: 'Question',
        content: 'What are your thoughts on this topic? I\'d love to hear your perspective in the comments below!'
      },
      {
        type: 'Call to Action',
        content: 'If this resonated with you, consider sharing it with someone who might find it helpful!'
      },
      {
        type: 'Interactive Prompt',
        content: 'Fill in the blank: The most important thing I learned from this is _______. Share your answer below!'
      }
    ]
  };
}

/**
 * POST handler for /api/engage
 * Accepts user's text and returns engagement suggestions
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

    // Get mock engagement suggestions
    const response = getMockEngagementSuggestions();

    // Return the suggestions
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

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 