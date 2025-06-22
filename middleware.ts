import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, allow access to the home page to show configuration instructions
    if (request.nextUrl.pathname === "/") {
      return NextResponse.next()
    }
    // Redirect all other routes to home page
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  try {
    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect routes that require authentication
    if (
      !user &&
      (
       request.nextUrl.pathname.startsWith("/dashboard") || 
       request.nextUrl.pathname.startsWith("/editor"))
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth"
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth page
    if (user && request.nextUrl.pathname === "/auth") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error with Supabase, redirect to home page
    if (request.nextUrl.pathname !== "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
