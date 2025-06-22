import type { AISuggestion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Check, X, Plus } from "lucide-react"

interface SuggestionsSidebarProps {
  suggestions: AISuggestion[]
  selectedId: string | null
  onAccept: (id: number) => void
  onIgnore: (id: number) => void
  onAddEngagement?: (suggestion: AISuggestion) => void
}

export function SuggestionsSidebar({
  suggestions,
  selectedId,
  onAccept,
  onIgnore,
  onAddEngagement,
}: SuggestionsSidebarProps) {
  const proposedSuggestions = suggestions.filter((s) => s.status === "proposed")

  const suggestionGroups = {
    spelling: proposedSuggestions.filter(
      (s) => s.type === "spelling" || s.type === "accuracy"
    ),
    grammarAndStyle: proposedSuggestions.filter(
      (s) => s.type === "grammar" || s.type === "style"
    ),
    engagement: proposedSuggestions.filter(
      (s) =>
        s.type === "question" ||
        s.type === "call-to-action" ||
        s.type === "interactive-prompt"
    ),
    smartPromo: proposedSuggestions.filter((s) => s.type === "smart-promo"),
  }

  const accordionSections = [
    {
      title: "Spelling",
      suggestions: suggestionGroups.spelling,
      variant: "destructive",
    },
    {
      title: "Grammar & Style",
      suggestions: suggestionGroups.grammarAndStyle,
      variant: "default",
    },
    {
      title: "Engagement Ideas",
      suggestions: suggestionGroups.engagement,
      variant: "default",
    },
    {
      title: "Smart Promo",
      suggestions: suggestionGroups.smartPromo,
      variant: "default",
    },
  ].filter((section) => section.suggestions.length > 0)

  const getTypeColor = (type: AISuggestion["type"]) => {
    switch (type) {
      case "spelling":
        return "bg-red-100 text-red-800 border-red-200"
      case "accuracy":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "grammar":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "style":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "question":
      case "call-to-action":
      case "interactive-prompt":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "smart-promo":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeLabel = (type: AISuggestion["type"]) => {
    switch (type) {
      case "spelling":
      case "grammar":
      case "style":
      case "accuracy":
        return type.charAt(0).toUpperCase() + type.slice(1)
      case "question":
        return "Question"
      case "call-to-action":
        return "Call to Action"
      case "interactive-prompt":
        return "Prompt"
      case "smart-promo":
        return "Smart Promo"
      default:
        return type
    }
  }

  const isEngagementSuggestion = (suggestion: AISuggestion) => {
    return (
      suggestion.type === "question" ||
      suggestion.type === "call-to-action" ||
      suggestion.type === "interactive-prompt"
    )
  }

  const isSmartPromoSuggestion = (suggestion: AISuggestion) => {
    return suggestion.type === "smart-promo"
  }

  const renderSuggestionCard = (s: AISuggestion) => (
    <div
      key={s.id}
      className={`p-3 m-2 rounded-lg border ${selectedId === String(s.id)
        ? "bg-blue-50 border-blue-200"
        : "bg-white border-gray-200"
        }`}
    >
      <div className="text-md font-medium text-gray-8 00 my-2">{s.suggested_text}</div>
      {
        isEngagementSuggestion(s) ? (
          <div
            className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getTypeColor(
              s.type
            )}`}
          >
            {getTypeLabel(s.type)}
          </div>
        ) :
          (!isSmartPromoSuggestion(s) && <div className="text-xs italic text-gray-600">{s.message}</div>)
      }

      <div className="flex gap-2 mb-2">
        {s.strategy && (
          <div
            className={`inline-block px-2 py-1 text-xs font-medium rounded border bg-purple-100 text-purple-800 border-purple-200`}
          >
            {s.strategy}
          </div>
        )}
      </div>

      {s.explanation && (
        <div className="text-xs text-gray-500 italic mb-2">
          {s.explanation}
        </div>
      )}

      <div className="flex gap-2 mt-4 flex-row-reverse">
        <Button
          variant="ghost"
          size="sm"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          onClick={() => onIgnore(s.id)}
        >
          Ignore
        </Button>
        {isEngagementSuggestion(s) ? (
          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onAddEngagement?.(s)}
          >
            Add
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onAccept(s.id)}
          >
            Accept
          </Button>
        )}

      </div>
    </div>
  )

  return (
    <aside className="w-[24rem]">
      <h2 className="text-xl font-bold mb-4">Suggestions</h2>
      {proposedSuggestions.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          No suggestions here. Keep writing!
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full" defaultValue={accordionSections[0]?.title}>
          {accordionSections.map((section) => (
            <AccordionItem value={section.title} key={section.title}>
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-3">
                  {section.title}
                  <Badge variant={section.variant === 'destructive' ? 'destructive' : 'secondary'} className="rounded-full">
                    {section.suggestions.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3">
                  {section.suggestions.map((s) => (
                    <li key={s.id}>{renderSuggestionCard(s)}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </aside>
  )
}