import type { AISuggestion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useState } from "react"

interface SuggestionsSidebarProps {
  suggestions: AISuggestion[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAccept: (suggestion: AISuggestion) => void
  onIgnore: (suggestion: AISuggestion) => void
}

export function SuggestionsSidebar({ 
  suggestions, 
  selectedId, 
  onSelect,
  onAccept,
  onIgnore 
}: SuggestionsSidebarProps) {
  const categories = ["Correctness", "Clarity", "Engagement", "Delivery"];
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);

  const filteredSuggestions = suggestions.filter(s => s.category === selectedCategory);

  return (
    <aside className="w-80 p-4 border-l bg-gray-50 h-full">
      <h2 className="font-bold mb-4">Suggestions</h2>
      <div className="flex gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 rounded text-sm font-semibold border ${selectedCategory === cat ? "bg-blue-600 text-white border-blue-600" : "bg-gray-200 text-gray-700 border-gray-300"}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      {filteredSuggestions.length === 0 && <div className="text-gray-500">No suggestions</div>}
      <ul className="space-y-2">
        {filteredSuggestions.map((s, idx) => (
          <li
            key={idx}
            className={`p-2 rounded ${selectedId === String(idx) ? "bg-blue-100" : "hover:bg-gray-200"}`}
          >
            <div className="font-medium">{s.message}</div>
            <div className="text-xs text-gray-500 mb-2">{s.suggested_text}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onAccept(s)}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => onIgnore(s)}
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