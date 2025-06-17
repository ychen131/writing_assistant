import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { AISuggestion } from "@/lib/types"

async function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options)
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 })
        } catch {
          // The `remove` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export async function POST(request: Request) {
  try {
    const supabase = await getServerClient()
    const { action, params } = await request.json()

    switch (action) {
      case "getCachedSuggestions": {
        const { documentId, textHash } = params
        const { data, error } = await supabase
          .from("suggestion_cache")
          .select("*")
          .eq("document_id", documentId)
          .eq("text_hash", textHash)
          .single()

        if (error || !data) {
          return NextResponse.json({ success: false, data: null })
        }

        return NextResponse.json({
          success: true,
          data: {
            id: data.id,
            suggestions: data.suggestions as AISuggestion[],
            version: data.version,
            expires_at: data.expires_at
          }
        })
      }

      case "saveSuggestions": {
        const { documentId, textHash, textContent, suggestions, version } = params
        const { error } = await supabase.from("suggestion_cache").upsert(
          {
            document_id: documentId,
            text_hash: textHash,
            text_content: textContent,
            suggestions: suggestions,
            version: version,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          },
          {
            onConflict: "document_id,text_hash",
          }
        )

        return NextResponse.json({ success: !error })
      }

      case "clearCache": {
        const { documentId } = params
        const { error } = await supabase
          .from("suggestion_cache")
          .delete()
          .eq("document_id", documentId)

        return NextResponse.json({ success: !error })
      }

      case "getCacheStats": {
        const { documentId } = params
        const { data, error } = await supabase
          .from("suggestion_cache")
          .select("created_at, text_content")
          .eq("document_id", documentId)
          .order("created_at", { ascending: true })

        if (error || !data) {
          return NextResponse.json({ 
            success: false, 
            stats: { totalEntries: 0, totalSize: 0, oldestEntry: null, newestEntry: null } 
          })
        }

        const totalSize = data.reduce((sum: number, entry: { text_content: string }) => 
          sum + entry.text_content.length, 0)

        return NextResponse.json({
          success: true,
          stats: {
            totalEntries: data.length,
            totalSize,
            oldestEntry: data.length > 0 ? data[0].created_at : null,
            newestEntry: data.length > 0 ? data[data.length - 1].created_at : null,
          }
        })
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Database operation error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 