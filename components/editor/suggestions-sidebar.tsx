import type { AISuggestion } from "@/lib/types"

interface SuggestionsSidebarProps {
  suggestions: AISuggestion[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function SuggestionsSidebar({ suggestions, selectedId, onSelect }: SuggestionsSidebarProps) {
  return (
    <aside className="w-80 p-4 border-l bg-gray-50 h-full">
      <h2 className="font-bold mb-4">Suggestions</h2>
      {suggestions.length === 0 && <div className="text-gray-500">No suggestions</div>}
      <ul className="space-y-2">
        {suggestions.map((s, idx) => (
          <li
            key={idx}
            className={`p-2 rounded cursor-pointer ${selectedId === String(idx) ? "bg-blue-100" : "hover:bg-gray-200"}`}
            onClick={() => onSelect(String(idx))}
          >
            <div className="font-medium">{s.message}</div>
            <div className="text-xs text-gray-500">{s.suggested_text}</div>
          </li>
        ))}
      </ul>
    </aside>
  )
}