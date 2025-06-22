"use client"

import { useState, useEffect } from 'react'
import { useDocumentVersions } from '@/hooks/use-document-versions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Pin, 
  RotateCcw, 
  Save, 
  Plus,
  Trash2,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface VersionHistoryModalProps {
  documentId: string
  documentTitle: string
  currentContent: string
  onRestore?: (content: string) => void
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function VersionHistoryModal({
  documentId,
  documentTitle,
  currentContent,
  onRestore,
  isOpen,
  onOpenChange,
}: VersionHistoryModalProps) {
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false)
  const [deleteVersion, setDeleteVersion] = useState<any>(null)
  
  const {
    versions,
    isLoading,
    fetchVersions,
    createVersion,
    restoreVersion,
    deleteVersion: hookDeleteVersion
  } = useDocumentVersions({
    documentId,
    onVersionRestore: onRestore
  })

  useEffect(() => {
    if (isOpen) {
      fetchVersions()
    }
  }, [isOpen, fetchVersions])

  const handleCreateSnapshot = async () => {
    if (!currentContent) return
    
    setIsCreatingSnapshot(true)
    try {
      await createVersion(currentContent, true, `Manual snapshot: ${documentTitle}`)
      fetchVersions() // refetch to show the new snapshot
    } catch (error) {
      console.error('Error creating snapshot:', error)
    } finally {
      setIsCreatingSnapshot(false)
    }
  }

  const handleRestoreVersion = async (versionId: string) => {
    try {
      await restoreVersion(versionId)
      onOpenChange(false) // Close modal after restore
    } catch (error) {
      console.error('Error restoring version:', error)
    }
  }

  const handleDeleteVersion = async (version: any) => {
    try {
      await hookDeleteVersion(version.id)
      setDeleteVersion(null)
    } catch (error) {
      console.error('Error deleting version:', error)
    }
  }

  const getVersionIcon = (version: any) => {
    if (version.is_pinned) {
      return <Pin className="h-4 w-4 text-blue-600" />
    }
    return <Save className="h-4 w-4 text-gray-500" />
  }

  const getVersionBadge = (version: any) => {
    if (version.is_pinned) {
      return <Badge variant="default" className="text-xs">Pinned</Badge>
    }
    return <Badge variant="secondary" className="text-xs">Auto-save</Badge>
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Version History
                </DialogTitle>
                <DialogDescription>
                  View and manage document versions. You can also create a new snapshot.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateSnapshot}
                  disabled={isCreatingSnapshot}
                >
                  {isCreatingSnapshot ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Snapshot
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Versions List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading versions...</p>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No versions yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Start editing to create auto-saved versions
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <Card key={version.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getVersionIcon(version)}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium truncate">
                              {version.description || `Version ${versions.length - index}`}
                            </CardTitle>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getVersionBadge(version)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteVersion(version)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreVersion(version.id)}
                          className="flex-1"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteVersion} onOpenChange={() => setDeleteVersion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this version? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteVersion && handleDeleteVersion(deleteVersion)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
