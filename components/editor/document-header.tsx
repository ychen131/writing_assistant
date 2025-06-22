"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, CheckCircle, Clock, Plus } from "lucide-react"
import Link from "next/link"
import { VersionHistoryModal } from "./version-history-modal"
import { useCallback, useState, useEffect } from "react"
import Image from "next/image"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDocumentVersions } from "@/hooks/use-document-versions"

interface DocumentHeaderProps {
  title: string
  onTitleChange: (newTitle: string) => void
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
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editableTitle, setEditableTitle] = useState(title)

  useEffect(() => {
    setEditableTitle(title)
  }, [title])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    if (editableTitle.trim() && editableTitle.trim() !== title) {
      onTitleChange(editableTitle.trim())
    } else {
      setEditableTitle(title) // Revert if empty or unchanged
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur()
    } else if (e.key === "Escape") {
      setEditableTitle(title)
      setIsEditingTitle(false)
    }
  }

  // Handle version restore
  const handleVersionRestore = useCallback((restoredText: string) => {
    updateTextContent(restoredText)
  }, [updateTextContent])

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false)

  const { createVersion } = useDocumentVersions({ documentId })

  const handleTakeSnapshot = async () => {
    setIsCreatingSnapshot(true)
    try {
      await createVersion(
        currentContent,
        true,
        `Manual snapshot: ${title || "Untitled Document"}`
      )
    } catch (error) {
      console.error("Error creating snapshot:", error)
    } finally {
      setIsCreatingSnapshot(false)
      setIsHistoryModalOpen(true) // Open history modal after snapshot
    }
  }

  return (
    <div className="border-b bg-green-50/50 border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-7 w-7 text-green-600"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="m9 15 2 2 4-4"></path>
                  </svg>
                  <span className="text-xl font-bold text-[#101827]">WordWise</span>
                </div>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="text-slate-600">
                    Documents
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isEditingTitle ? (
                  <Input
                    type="text"
                    value={editableTitle}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    autoFocus
                    className="text-lg h-9"
                  />
                ) : (
                  <BreadcrumbPage
                    className="text-slate-900 text-lg cursor-pointer"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {title || "Untitled Document"}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-4">
          {isAnalyzing && (
            <Badge variant="secondary" className="animate-pulse">
              Analyzing...
            </Badge>
          )}

          {suggestionsCount > 0 && (
            <Badge variant="outline" className="bg-gray-50 text-gray-600">
              {suggestionsCount} suggestion{suggestionsCount !== 1 ? "s" : ""}
            </Badge>
          )}

          {isSaving ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Save className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
              <CheckCircle className="h-4 w-4" />
              Saved
            </div>
          ) : null}

          <Button
            variant="outline"
            className="bg-white border-gray-300"
            onClick={handleTakeSnapshot}
            disabled={isCreatingSnapshot}
          >
            {isCreatingSnapshot ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
            ) : (
             null
            )}
            Take Snapshot
          </Button>

          <Avatar>
            <AvatarFallback className="bg-green-600 text-white">Y</AvatarFallback>
          </Avatar>

          <VersionHistoryModal
            documentId={documentId}
            documentTitle={title || "Untitled Document"}
            currentContent={currentContent}
            onRestore={handleVersionRestore}
            isOpen={isHistoryModalOpen}
            onOpenChange={setIsHistoryModalOpen}
          />
        </div>
      </div>
    </div>
  )
} 