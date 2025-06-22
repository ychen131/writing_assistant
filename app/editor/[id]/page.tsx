"use client"

import { useEffect, useCallback, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { useDocumentEditor } from "@/hooks/use-document-editor"
import { useSuggestions } from "@/hooks/use-suggestions"
import { useDocumentVersions } from "@/hooks/use-document-versions"
import { DocumentHeader } from "@/components/editor/document-header"
import { EditorWorkspace } from "@/components/editor/editor-workspace"
import { useDebounce } from "@/hooks/use-debounce"
import type { AISuggestion } from "@/lib/types"

export default function EditorPage() {
  const params = useParams()
  const documentId = params.id as string

  // Core document management
  const {
    document,
    title,
    textContent,
    isLoading,
    isSaving,
    lastSaved,
    updateTitle,
    updateTextContent,
  } = useDocumentEditor()

  const [needsSync, setNeedsSync] = useState(true)
  // whenever we update textContent outside of the editor flow,
  // we'll use needsSync to true so that we can refresh the editor
  const setSynced = () => setNeedsSync(false) 

  // Unified suggestions management
  const {
    suggestions,
    isAnalyzing,
    selectedSuggestionId,
    setSelectedSuggestionId,
    acceptSuggestion,
    ignoreSuggestion,
    triggerAnalysis,
    addSuggestions,
  } = useSuggestions()

  const updateTextAndSync = useCallback((newText: string) => {
    setNeedsSync(true)
    updateTextContent(newText)
  }, [updateTextContent])

  // Version management
  const { createVersion } = useDocumentVersions({
    documentId,
    onVersionCreate: () => {
      console.log("Version created successfully")
    },
    onVersionRestore: (restoredText) => {
      setNeedsSync(true)
      updateTextContent(restoredText)
      triggerAnalysis(restoredText)
    }
  })

  // Debounced text for version creation (5 minutes)
  const debouncedContentForVersion = useDebounce(textContent, 300000)

  // Auto-save versions every 5 minutes
  useEffect(() => {
    if (debouncedContentForVersion && document) {
      createVersion(debouncedContentForVersion, false, 'Auto-saved version')
    }
  }, [debouncedContentForVersion, document, createVersion])

  const [lastAcceptedSuggestion, setLastAcceptedSuggestion] = useState(textContent)

  // Handle suggestion acceptance
  // we need to accept the suggestion _and_ update the text content
  const handleAcceptSuggestion = useCallback((index: number) => {
    const newText = acceptSuggestion(index, textContent)
    setLastAcceptedSuggestion(newText)
    updateTextAndSync(newText)
  }, [acceptSuggestion, textContent, updateTextAndSync])

  // Handle adding new suggestions (for engagement suggestions)
  const handleAddSuggestions = useCallback((newSuggestions: AISuggestion[]) => {
    addSuggestions(newSuggestions)
  }, [addSuggestions])

  // Handle engagement suggestion addition
  const handleAddEngagementSuggestion = useCallback((suggestion: AISuggestion) => {
    // Check if this is an engagement suggestion (has start_index: -1)
    if (suggestion.start_index === -1) {
      // Append to the end of the document
      const newText = textContent + '\n\n' + suggestion.suggested_text
      updateTextAndSync(newText)
      
      // Remove the suggestion from the list
      ignoreSuggestion(suggestion.id)
      
      console.log('Added engagement suggestion:', suggestion.suggested_text)
    }
  }, [textContent, updateTextAndSync, ignoreSuggestion])

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DocumentHeader
          // document metadata sync with DB
          title={title}
          onTitleChange={updateTitle}

          // for displaying status indicators
          isSaving={isSaving}
          lastSaved={lastSaved}
          isAnalyzing={isAnalyzing}
          suggestionsCount={suggestions.filter(s => s.status === 'proposed').length}

          // propagated through for managing document versions
          documentId={documentId}
          currentContent={textContent}
          updateTextContent={updateTextAndSync}
        />

        <div className="mt-6">
          <EditorWorkspace
            textContent={textContent}
            onTextChange={(text) => {
              if(text !== lastAcceptedSuggestion) {
                // Trigger analysis immediately - the hook will handle debouncing and cancellation
                triggerAnalysis(text)
              }
              updateTextContent(text)
            }}
            suggestions={suggestions}
            selectedSuggestionId={selectedSuggestionId}
            onSuggestionClick={setSelectedSuggestionId}
            acceptSuggestion={handleAcceptSuggestion}
            ignoreSuggestion={ignoreSuggestion}
            needsSync={needsSync}
            setSynced={setSynced}
            onRewrite={(originalText: string, rewrittenText: string) => {
              const newText = textContent.replace(originalText, rewrittenText);
              updateTextAndSync(newText);
            }}
            onAddSuggestions={handleAddSuggestions}
            onAddEngagementSuggestion={handleAddEngagementSuggestion}
          />
        </div>
      </main>
    </div>
  )
}
