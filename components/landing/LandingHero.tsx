import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Renders the hero section for the landing page.
 * It features a two-column layout with a headline, description,
 * call-to-action buttons, and a prominent image.
 */
export default function LandingHero() {
  return (
    <main className="flex-1">
      <section className="container mx-auto flex flex-col items-center gap-12 px-4 py-16 md:flex-row">
        {/* Left Column: Text Content */}
        <div className="flex flex-col items-start gap-6 md:w-1/2">
          <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
            For Content Creators & Storytellers
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-gray-900 md:text-5xl lg:text-6xl">
            Write with Clarity, Spark with{" "}
            <span className="text-green-600">Creativity.</span>
          </h1>
          <p className="max-w-md text-gray-600 md:text-xl">
            WordWise is your AI-powered partner for crafting compelling content.
            Go beyond grammar and spelling to refine your tone, find your
            voice, and tell unforgettable stories.
          </p>
          <div className="flex gap-4">
            <Link href="/auth">
              <Button size="lg" className="bg-green-600 text-white hover:bg-green-700">
                Get Started For Free
              </Button>
            </Link>
            <Link href="#">
              <Button size="lg" variant="outline">
                See a Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="md:w-1/2">
          <Image
            src="/trovatrip-fitz-roy-hiker.jpg"
            alt="A hiker with a backpack in a beautiful mountain landscape"
            width={600}
            height={400}
            className="rounded-xl object-cover shadow-lg"
            priority
          />
        </div>
      </section>
    </main>
  );
} 