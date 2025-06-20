/**
 * API endpoint for the "I Need Inspiration" feature
 * 
 * This endpoint generates three distinct writing angles based on a user's topic.
 * Currently returns mock data for development and testing purposes.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Type definition for the request body
 */
interface InspireRequest {
  topic: string;
}

/**
 * Type definition for the response structure
 */
interface InspireResponse {
  angles: Array<{
    angle_type: 'Personal Anecdote' | 'Informative/Tips' | 'Descriptive/Sensory';
    content: string;
  }>;
}

/**
 * Generates mock inspiration angles for development and testing
 * 
 * @param topic - The user's input topic
 * @returns Mock response with three distinct writing angles
 */
function generateMockAngles(topic: string): InspireResponse {
  return {
    angles: [
      {
        angle_type: 'Personal Anecdote',
        content: `I remember the first time I encountered ${topic}. It was one of those moments that completely shifted my perspective. The experience taught me something unexpected about myself and the world around me. Looking back now, I realize how that simple encounter became a turning point in my journey.`
      },
      {
        angle_type: 'Informative/Tips',
        content: `When it comes to ${topic}, there's one crucial tip that most people overlook: start small and build gradually. Many beginners make the mistake of diving in too deep too quickly, which often leads to overwhelm and burnout. The key is to establish a solid foundation first, then expand your horizons step by step.`
      },
      {
        angle_type: 'Descriptive/Sensory',
        content: `The atmosphere around ${topic} is almost palpable - you can feel the energy in the air, hear the subtle sounds that create the perfect backdrop, and see the way light plays across surfaces. Every detail contributes to an experience that engages all your senses and leaves you with lasting memories.`
      }
    ]
  };
}

/**
 * Handles POST requests to generate inspiration angles
 * 
 * @param request - The incoming HTTP request
 * @returns JSON response with three writing angles
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body: InspireRequest = await request.json();
    
    // Validate that topic is provided
    if (!body.topic || typeof body.topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate mock angles based on the topic
    const response = generateMockAngles(body.topic);

    // Return the mock response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in /api/inspire:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 