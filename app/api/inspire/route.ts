/**
 * API endpoint for the "I Need Inspiration" feature
 * 
 * This endpoint generates three distinct writing angles based on a user's topic
 * using OpenAI's GPT-4o-mini model.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

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
 * AI prompt for generating inspiration angles
 * Based on the feature brief requirements
 */
const INSPIRATION_PROMPT = `**Role:**
You are an expert writing assistant named WordWise, specializing in helping lifestyle content creators (especially in food and travel) brainstorm engaging ideas. Your tone is creative, helpful, and encouraging.

**Task:**
Based on the user's topic sentence, you will generate three distinct content angles to inspire their writing. Each angle must be a unique paragraph that serves as a potential starting point for a blog post or social media update.

**User's Topic:**
{{USER_TOPIC}}

**Required Angles:**
You must generate exactly one of each of the following three angles:
1.  **A Personal Anecdote:** Write a short, engaging, first-person story or memory related to the topic. Make it feel personal and relatable.
2.  **An Informative/Tips Angle:** Provide a practical and helpful paragraph. This could include a key tip, a surprising fact, or a mini "how-to" insight that provides immediate value to the reader.
3.  **A Descriptive/Sensory Angle:** Write a vivid paragraph that focuses on the senses (sight, sound, taste, smell, touch). Your goal is to paint a picture and create a strong atmosphere for the reader.

**Constraints:**
* Each angle must be a single paragraph.
* Each paragraph must be under 150 words.
* The writing style must be engaging and accessible, not overly academic or formal.
* You must provide your response in the JSON format specified below.

**Output Format:**
Respond with a valid JSON object. The root object should have a single key, "angles," which is an array of three objects. Each object in the array must have two keys: "angle_type" and "content".

{
  "angles": [
    {
      "angle_type": "Personal Anecdote",
      "content": "Your generated paragraph for the personal anecdote goes here."
    },
    {
      "angle_type": "Informative/Tips",
      "content": "Your generated paragraph with tips or information goes here."
    },
    {
      "angle_type": "Descriptive/Sensory",
      "content": "Your generated paragraph focusing on sensory details goes here."
    }
  ]
}`;

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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    console.log('Generating inspiration angles for topic:', body.topic);

    // Replace the placeholder in the prompt with the actual topic
    const promptWithTopic = INSPIRATION_PROMPT.replace('{{USER_TOPIC}}', body.topic);

    // Use OpenAI GPT-4o-mini to generate inspiration angles
    const { text: aiResponse } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: promptWithTopic,
      temperature: 0.8, // Slightly higher temperature for more creative responses
    });

    // Parse the AI response
    let response: InspireResponse;
    try {
      const parsedResponse = JSON.parse(aiResponse);
      
      // Validate the response structure
      if (!parsedResponse.angles || !Array.isArray(parsedResponse.angles)) {
        throw new Error('AI response does not contain angles array');
      }

      if (parsedResponse.angles.length !== 3) {
        throw new Error('AI response does not contain exactly 3 angles');
      }

      // Validate each angle has the required structure
      for (const angle of parsedResponse.angles) {
        if (!angle.angle_type || !angle.content) {
          throw new Error('Angle missing required fields: angle_type or content');
        }
        
        if (!['Personal Anecdote', 'Informative/Tips', 'Descriptive/Sensory'].includes(angle.angle_type)) {
          throw new Error(`Invalid angle type: ${angle.angle_type}`);
        }
      }

      response = parsedResponse as InspireResponse;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    console.log('Successfully generated inspiration angles');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in /api/inspire:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate inspiration angles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 