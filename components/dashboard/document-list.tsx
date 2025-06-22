"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Document } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { FileText, Plus, MoreVertical, Pencil, Trash2, Calendar, LayoutGrid, List } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { InspirationModal } from "@/components/editor/inspiration-modal"

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDocument, setDeleteDocument] = useState<Document | null>(null)
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [isInspirationModalOpen, setIsInspirationModalOpen] = useState(false)
  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("dashboardView")
      if (savedView === "grid" || savedView === "list") {
        return savedView
      }
    }
    return "grid"
  })
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    localStorage.setItem("dashboardView", view)
  }, [view])

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase.from("documents").select("*").order("updated_at", { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewDocument = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) throw new Error("No authenticated user found")

      const { data, error } = await supabase
        .from("documents")
        .insert([{ 
          title: "Untitled Document",
          user_id: user.id,
          plain_text_content: ""
        }])
        .select()
        .single()

      if (error) throw error

      // Redirect to the new document
      window.location.href = `/editor/${data.id}`
    } catch (error) {
      console.error("Error creating document:", error)
    }
  }

  const handleDeleteDocument = async (doc: Document) => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", doc.id)

      if (error) throw error

      setDocuments(documents.filter((d) => d.id !== doc.id))
      setDeleteDocument(null)
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const handleRenameDocument = async (docId: string, title: string) => {
    try {
      const { error } = await supabase.from("documents").update({ title }).eq("id", docId)

      if (error) throw error

      setDocuments(documents.map((d) => (d.id === docId ? { ...d, title } : d)))
      setEditingTitle(null)
    } catch (error) {
      console.error("Error renaming document:", error)
    }
  }

  /**
   * Handles opening the inspiration modal
   */
  const handleOpenInspirationModal = () => {
    setIsInspirationModalOpen(true)
  }

  /**
   * Handles closing the inspiration modal
   */
  const handleCloseInspirationModal = () => {
    setIsInspirationModalOpen(false)
  }

  /**
   * Handles continuing without inspiration (creates blank document)
   */
  const handleContinueWithoutInspiration = () => {
    createNewDocument()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Documents</h1>
          <p className="text-gray-600 mt-1">
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-md bg-gray-200 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("grid")}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-gray-600 hover:bg-gray-300'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("list")}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-gray-600 hover:bg-gray-300'}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleOpenInspirationModal} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="mb-2">No documents yet</CardTitle>
            <CardDescription className="mb-4">
              Create your first document to get started with WordWise.
            </CardDescription>
            <Button onClick={handleOpenInspirationModal} className="bg-green-600 text-white hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {view === "grid" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <Card key={doc.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingTitle === doc.id ? (
                          <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={() => {
                              if (newTitle.trim()) {
                                handleRenameDocument(doc.id, newTitle.trim())
                              } else {
                                setEditingTitle(null)
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                if (newTitle.trim()) {
                                  handleRenameDocument(doc.id, newTitle.trim())
                                } else {
                                  setEditingTitle(null)
                                }
                              } else if (e.key === "Escape") {
                                setEditingTitle(null)
                              }
                            }}
                            className="text-lg font-semibold"
                            autoFocus
                          />
                        ) : (
                          <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setTimeout(() => {
                                setEditingTitle(doc.id)
                                setNewTitle(doc.title)
                              }, 100)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteDocument(doc)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 h-[40px]">
                        {doc.plain_text_content || "No content yet..."}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                    <Link href={`/editor/${doc.id}`} className="block mt-auto">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                        Open Document
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {view === "list" && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 font-medium text-sm text-gray-500 border-b">
                <div className="col-span-4">Title</div>
                <div className="col-span-4">Preview</div>
                <div className="col-span-2">Last Updated</div>
                <div className="col-span-2"></div>
              </div>
              {documents.map((doc) => (
                <div key={doc.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-white rounded-lg shadow-sm hover:bg-gray-50">
                  <div className="col-span-4 font-medium">
                    {editingTitle === doc.id ? (
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => {
                          if (newTitle.trim()) {
                            handleRenameDocument(doc.id, newTitle.trim())
                          } else {
                            setEditingTitle(null)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (newTitle.trim()) {
                              handleRenameDocument(doc.id, newTitle.trim())
                            } else {
                              setEditingTitle(null)
                            }
                          } else if (e.key === "Escape") {
                            setEditingTitle(null)
                          }
                        }}
                        className="font-medium"
                        autoFocus
                      />
                    ) : (
                      <span className="truncate">{doc.title}</span>
                    )}
                  </div>
                  <div className="col-span-4 text-sm text-gray-600 line-clamp-1">
                    {doc.plain_text_content || "No content yet..."}
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Link href={`/editor/${doc.id}`}>
                      <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5">Open</Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setTimeout(() => {
                              setEditingTitle(doc.id)
                              setNewTitle(doc.title)
                            }, 100)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteDocument(doc)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDocument} onOpenChange={() => setDeleteDocument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDocument?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDocument && handleDeleteDocument(deleteDocument)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Inspiration Modal */}
      <InspirationModal
        isOpen={isInspirationModalOpen}
        onClose={handleCloseInspirationModal}
        onContinue={handleContinueWithoutInspiration}
      />
    </div>
  )
}

// eslint-disable-next-line react/no-unescaped-entities
// eslint-disable-next-line react-hooks/exhaustive-deps
