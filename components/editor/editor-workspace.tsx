"use client"

import { LexicalEditor } from "./lexical-editor"
import { SuggestionsSidebar } from "./suggestions-sidebar"
import type { AISuggestion } from "@/lib/types"

interface EditorWorkspaceProps {
  textContent: string
  onTextChange: (text: string) => void
  suggestions: AISuggestion[]
  selectedSuggestionId: string | null
  onSuggestionClick: (id: string) => void
  acceptSuggestion: (index: number) => void
  ignoreSuggestion: (index: number) => void
  setSuggestions: (suggestions: AISuggestion[]) => void
}

export function EditorWorkspace({
  textContent,
  onTextChange,
  suggestions,
  selectedSuggestionId,
  onSuggestionClick,
  acceptSuggestion,
  ignoreSuggestion,
}: EditorWorkspaceProps) {
  return (
    <main className="container mx-auto flex gap-4 py-4">
      <div className="max-w-4xl mx-auto flex-1">
        <LexicalEditor
          onTextChange={onTextChange}
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
          selectedSuggestionId={selectedSuggestionId}
          initialText={textContent}
        />
      </div>
      <SuggestionsSidebar
        suggestions={suggestions}
        selectedId={selectedSuggestionId}
        onAccept={acceptSuggestion}
        onIgnore={ignoreSuggestion}
      />
    </main>
  )
} 