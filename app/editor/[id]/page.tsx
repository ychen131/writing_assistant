"use client"

import { useEffect, useCallback } from "react"
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

  // Suggestion management
  const {
    suggestions,
    isAnalyzing,
    selectedSuggestionId,
    isApplyingSuggestions,
    setSuggestions,
    setSelectedSuggestionId,
    setIsApplyingSuggestions,
    acceptSuggestion,
    ignoreSuggestion,
    triggerAnalysis,
  } = useSuggestions()

  // Version management
  const { createVersion } = useDocumentVersions({
    documentId,
    onVersionCreate: () => {
      console.log("Version created successfully")
    },
    onVersionRestore: (restoredText) => {
      updateTextContent(restoredText)
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

  // Trigger analysis when text changes (debounced)
  useEffect(() => {
    triggerAnalysis(textContent)
  }, [useDebounce(textContent, 1000), triggerAnalysis])

  // Handle suggestion acceptance
  // we need to accept the suggestion _and_ update the text content
  const handleAcceptSuggestion = useCallback((index: number) => {
    const newText = acceptSuggestion(index, textContent)
    updateTextContent(newText)
  }, [acceptSuggestion, textContent, updateTextContent])



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
        updateTextContent={updateTextContent}
      />

      <EditorWorkspace
        textContent={textContent}
        onTextChange={updateTextContent}
        suggestions={suggestions}
        selectedSuggestionId={selectedSuggestionId}
        onSuggestionClick={setSelectedSuggestionId}
        acceptSuggestion={handleAcceptSuggestion}
        ignoreSuggestion={ignoreSuggestion}
        setSuggestions={setSuggestions}
        setIsApplyingSuggestions={setIsApplyingSuggestions}
      />
    </div>
  )
}
