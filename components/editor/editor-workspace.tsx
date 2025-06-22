"use client"

import { LexicalEditor } from "./lexical-editor"
import { SuggestionsSidebar } from "./suggestions-sidebar"
import type { AISuggestion } from "@/lib/types"

interface EditorWorkspaceProps {
  textContent: string
  onTextChange: (text: string) => void
  needsSync: boolean
  setSynced: () => void
  suggestions: AISuggestion[]
  selectedSuggestionId: string | null
  onSuggestionClick: (id: string | null) => void
  acceptSuggestion: (index: number) => void
  ignoreSuggestion: (index: number) => void
  onRewrite: (originalText: string, rewrittenText: string) => void
  // Unified suggestions management
  onAddSuggestions: (suggestions: AISuggestion[]) => void
  onAddEngagementSuggestion: (suggestion: AISuggestion) => void
}

export function EditorWorkspace({
  textContent,
  onTextChange,
  needsSync,
  setSynced,
  suggestions,
  selectedSuggestionId,
  onSuggestionClick,
  acceptSuggestion,
  ignoreSuggestion,
  onRewrite,
  onAddSuggestions,
  onAddEngagementSuggestion,
}: EditorWorkspaceProps) {
  return (
    <div className="flex gap-8">
      <div className="flex-1 rounded-xl bg-white p-8 shadow-md border border-gray-200 ">
        <LexicalEditor
          onTextChange={onTextChange}
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
          selectedSuggestionId={selectedSuggestionId}
          initialText={textContent}
          needsSync={needsSync}
          setSynced={setSynced}
          onRewrite={onRewrite}
          onAddSuggestions={onAddSuggestions}
        />
      </div>
      
      {/* Unified Suggestions Sidebar */}
      <SuggestionsSidebar
        suggestions={suggestions}
        selectedId={selectedSuggestionId}
        onAccept={acceptSuggestion}
        onIgnore={ignoreSuggestion}
        onAddEngagement={onAddEngagementSuggestion}
      />
    </div>
  )
} 