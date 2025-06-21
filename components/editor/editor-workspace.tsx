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
  onSuggestionClick: (id: string) => void
  acceptSuggestion: (index: number) => void
  ignoreSuggestion: (index: number) => void
  onRewrite: (originalText: string, rewrittenText: string) => void
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
          needsSync={needsSync}
          setSynced={setSynced}
          onRewrite={onRewrite}
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