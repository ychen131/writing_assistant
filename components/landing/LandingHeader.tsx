import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * Renders the header for the landing page.
 * It includes the application logo, navigation links, and authentication buttons,
 * reflecting the final design.
 */
export default function LandingHeader() {
  return (
    <header className="border-b border-gray-200 bg-transparent">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          {/* Updated Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-green-600"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="m9 15 2 2 4-4"></path>
          </svg>
          <span className="text-2xl font-bold">WordWise</span>
        </div>
        <div className="flex items-center space-x-8">
          <nav className="hidden items-center space-x-8 md:flex">
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
          </nav>
          <div className="hidden items-center space-x-6 md:flex">
            <Link href="/auth" className="font-medium text-gray-600 hover:text-gray-900">
              Log In
            </Link>
            <Link href="/auth">
              <Button className="bg-green-600 text-white hover:bg-green-700">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 