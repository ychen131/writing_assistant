import { ConfigurationGuide } from "@/components/setup/configuration-guide"
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/dashboard")
}
