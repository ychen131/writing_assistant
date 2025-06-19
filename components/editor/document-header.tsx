"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, CheckCircle } from "lucide-react"
import Link from "next/link"
import { VersionHistoryModal } from "./version-history-modal"
import { useCallback } from "react"

interface DocumentHeaderProps {
  title: string
  onTitleChange: (title: string) => void
  isSaving: boolean
  lastSaved: Date | null
  isAnalyzing: boolean
  suggestionsCount: number
  documentId: string
  currentContent: string
  updateTextContent: (text: string) => void
}

export function DocumentHeader({
  title,
  onTitleChange,
  isSaving,
  lastSaved,
  isAnalyzing,
  suggestionsCount,
  documentId,
  currentContent,
  updateTextContent,
}: DocumentHeaderProps) {
    // Handle version restore
    const handleVersionRestore = useCallback((restoredText: string) => {
      updateTextContent(restoredText)
    }, [updateTextContent])
  

  return (
    <div className="border-b bg-gray-50 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          </Link>

          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0"
            placeholder="Document title..."
          />
        </div>

        <div className="flex items-center gap-3">
          {isAnalyzing && (
            <Badge variant="secondary" className="animate-pulse">
              Analyzing...
            </Badge>
          )}

          {suggestionsCount > 0 && (
            <Badge variant="outline">
              {suggestionsCount} suggestion{suggestionsCount !== 1 ? "s" : ""}
            </Badge>
          )}

          {isSaving ? (
            <Badge variant="secondary">
              <Save className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </Badge>
          ) : lastSaved ? (
            <Badge variant="outline">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          ) : null}

          <VersionHistoryModal
            documentId={documentId}
            documentTitle={title || "Untitled Document"}
            currentContent={currentContent}
            onRestore={handleVersionRestore}
          />
        </div>
      </div>
    </div>
  )
} 