import type { AISuggestion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Check, X, Plus } from "lucide-react"

interface SuggestionsSidebarProps {
  suggestions: AISuggestion[]
  selectedId: string | null
  onAccept: (index: number) => void
  onIgnore: (index: number) => void
  onAddEngagement?: (suggestion: AISuggestion) => void
}

export function SuggestionsSidebar({ 
  suggestions, 
  selectedId, 
  onAccept,
  onIgnore,
  onAddEngagement
}: SuggestionsSidebarProps) {
  const proposedSuggestions = suggestions.filter(s => s.status === "proposed");
  
  // Separate engagement suggestions from AI suggestions
  const engagementSuggestions = proposedSuggestions.filter(s => 
    s.type === "question" || s.type === "call-to-action" || s.type === "interactive-prompt"
  );
  const aiSuggestions = proposedSuggestions.filter(s => 
    s.type === "spelling" || s.type === "grammar" || s.type === "style"
  );
  const smartPromoSuggestions = proposedSuggestions.filter(s => 
    s.type === "smart-promo"
  );
  
  const getTypeColor = (type: AISuggestion['type']) => {
    switch (type) {
      case "spelling":
        return "bg-red-100 text-red-800 border-red-200"
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

  const getTypeLabel = (type: AISuggestion['type']) => {
    switch (type) {
      case "spelling":
      case "grammar":
      case "style":
        return type.charAt(0).toUpperCase() + type.slice(1)
      case "question":
      case "call-to-action":
      case "interactive-prompt":
        return "Engagement"
      case "smart-promo":
        return "Smart Promo"
      default:
        return type
    }
  }

  const isEngagementSuggestion = (suggestion: AISuggestion) => {
    return suggestion.type === "question" || suggestion.type === "call-to-action" || suggestion.type === "interactive-prompt"
  }

  const isSmartPromoSuggestion = (suggestion: AISuggestion) => {
    return suggestion.type === "smart-promo"
  }

  const renderSuggestion = (s: AISuggestion) => (
    <li
      key={s.id}
      className={`p-2 rounded ${selectedId === String(s.id) ? "bg-blue-100" : "hover:bg-gray-200"} ${
        isEngagementSuggestion(s) ? "bg-yellow-50 border border-yellow-200" : ""
      } ${
        isSmartPromoSuggestion(s) ? "bg-purple-50 border border-purple-200" : ""
      }`}
    >
      {!isSmartPromoSuggestion(s) && <div className="font-medium">{s.message}</div>}
      <div className={
        isSmartPromoSuggestion(s)
          ? "text-sm text-gray-700 mb-2"
          : "text-xs text-gray-500 mb-2"
      }>
        {s.suggested_text}
      </div>
      
      {/* Badge Section */}
      <div className="flex gap-2 mb-2">
        {isSmartPromoSuggestion(s) ? (
          <>
            <div className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getTypeColor(s.type)}`}>
              {getTypeLabel(s.type)}
            </div>
            {s.strategy && (
              <div className={`inline-block px-2 py-1 text-xs font-medium rounded border bg-purple-100 text-purple-800 border-purple-200`}>
                {s.strategy}
              </div>
            )}
          </>
        ) : (
          <div className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getTypeColor(s.type)}`}>
            {getTypeLabel(s.type)}
          </div>
        )}
      </div>
      
      {/* Explanation for Smart Promo suggestions */}
      {s.explanation && (
        <div className="text-xs text-gray-600 italic mb-2">
          {s.explanation}
        </div>
      )}
      
      <div className="flex gap-2">
        {isEngagementSuggestion(s) ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onAddEngagement?.(s)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onAccept(s.id)}
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => onIgnore(s.id)}
        >
          <X className="h-4 w-4 mr-1" />
          {isEngagementSuggestion(s) ? "Ignore" : "Ignore"}
        </Button>
      </div>
    </li>
  )

  return (
    <aside className="w-[30rem] p-4 border-l bg-gray-50 h-full">
      <h2 className="font-bold mb-4">Suggestions</h2>
      {proposedSuggestions.length === 0 && <div className="text-gray-500">No suggestions</div>}
      <ul className="space-y-2">
        {/* Smart Promo suggestions first */}
        {smartPromoSuggestions.map(renderSuggestion)}
        
        {/* Engagement suggestions second */}
        {engagementSuggestions.map(renderSuggestion)}
        
        {/* AI suggestions third */}
        {aiSuggestions.map(renderSuggestion)}
      </ul>
    </aside>
  )
}