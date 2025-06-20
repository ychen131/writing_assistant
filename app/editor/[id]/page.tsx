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

  // Suggestion management
  const {
    suggestions,
    isAnalyzing,
    selectedSuggestionId,
    setSelectedSuggestionId,
    acceptSuggestion,
    ignoreSuggestion,
    triggerAnalysis,
  } = useSuggestions()

  triggerAnalysis(textContent);


  const updateTextAndSync = (newText: string) => {
    setNeedsSync(true)
    updateTextContent(newText)
  }

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
  }, [acceptSuggestion, textContent, updateTextContent])


  const [needsAnalysis, setNeedsAnalysis] = useState(false)

  const debouncedNeedsAnalysis = useDebounce(needsAnalysis, 10000)

  // Trigger analysis when text changes
  // - debounced for 10s to avoid triggering analysis on every change
  // - only trigger if the last change was from the editor
  useEffect(() => {
    if(debouncedNeedsAnalysis) {
      triggerAnalysis(textContent)
      setNeedsAnalysis(false)
    }
  }, [debouncedNeedsAnalysis, textContent, triggerAnalysis])


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-white">
      <Header />
      
      <DocumentHeader
        // document metadata sync with DB
        title={title}
        onTitleChange={updateTitle}

        // for displaying status indicators
        isSaving={isSaving}
        lastSaved={lastSaved}
        isAnalyzing={isAnalyzing}
        suggestionsCount={suggestions.length}

        // propagated through for managing document versions
        documentId={documentId}
        currentContent={textContent}
        updateTextContent={updateTextAndSync}
      />

      <EditorWorkspace
        textContent={textContent}
        onTextChange={(text) => {
          if(text !== lastAcceptedSuggestion) {
            setNeedsAnalysis(true)
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
      />
    </div>
  )
}
