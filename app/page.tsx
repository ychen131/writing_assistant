import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ConfigurationGuide } from "@/components/setup/configuration-guide"

export default async function HomePage() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    } else {
      redirect("/auth")
    }
  } catch (error) {
    // Handle Supabase configuration errors by showing the setup guide
    console.error(error)
    return <ConfigurationGuide />
  }
}
