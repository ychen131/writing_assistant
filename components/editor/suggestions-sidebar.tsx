import type { AISuggestion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface SuggestionsSidebarProps {
  suggestions: AISuggestion[]
  selectedId: string | null
  onAccept: (index: number) => void
  onIgnore: (index: number) => void
}

export function SuggestionsSidebar({ 
  suggestions, 
  selectedId, 
  onAccept,
  onIgnore 
}: SuggestionsSidebarProps) {
  const proposedSuggestions = suggestions.filter(s => s.status === "proposed");
  
  const getTypeColor = (type: "spelling" | "grammar" | "style") => {
    switch (type) {
      case "spelling":
        return "bg-red-100 text-red-800 border-red-200"
      case "grammar":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "style":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeLabel = (type: "spelling" | "grammar" | "style") => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <aside className="w-[30rem] p-4 border-l bg-gray-50 h-full">
      <h2 className="font-bold mb-4">Suggestions</h2>
      {proposedSuggestions.length === 0 && <div className="text-gray-500">No suggestions</div>}
      <ul className="space-y-2">
        {proposedSuggestions.map((s) => (
          <li
            key={s.id}
            className={`p-2 rounded ${selectedId === String(s.id) ? "bg-blue-100" : "hover:bg-gray-200"}`}
          >
            <div className="font-medium">{s.message}</div>
            <div className="text-xs text-gray-500 mb-2">{s.suggested_text}</div>
            <div className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getTypeColor(s.type)} mb-2`}>
              {getTypeLabel(s.type)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onAccept(s.id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => onIgnore(s.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Ignore
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}