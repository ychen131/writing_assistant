import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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

    const { text } = await request.json()

    if (!text || text.length < 10) {
      return NextResponse.json({ suggestions: [] })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured")
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 })
    }

    // Use OpenAI GPT-4o-mini to analyze the text
    const { text: analysis } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Analyze the following text for grammar, spelling, and style issues. Return your response as a JSON array of suggestions. Each suggestion should have the following structure:
{
  "type": "grammar" | "spelling" | "style",
  "original_text": "the text that needs correction",
  "suggested_text": "the corrected text",
  "start_index": number (character position where the issue starts),
  "end_index": number (character position where the issue ends),
  "message": "explanation of the issue and why the suggestion improves it"
}

Only return the JSON array, no other text. If no issues are found, return an empty array [].

Text to analyze:
${text}`,
    })

    let suggestions = []
    try {
      suggestions = JSON.parse(analysis)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      suggestions = []
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error analyzing text:", error)
    return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 })
  }
}
