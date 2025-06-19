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
import { FileText, Plus, MoreVertical, Pencil, Trash2, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDocument, setDeleteDocument] = useState<Document | null>(null)
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

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
          user_id: user.id 
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
        <Button onClick={createNewDocument} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="mb-2">No documents yet</CardTitle>
            <CardDescription className="mb-4">
              Create your first document to get started with WordWise.
            </CardDescription>
            <Button onClick={createNewDocument}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
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
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Updated {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                  </div>
                  <Link href={`/editor/${doc.id}`}>
                    <Button className="w-full">Open Document</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteDocument} onOpenChange={() => setDeleteDocument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDocument?.title}"? This action cannot be undone.
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
    </div>
  )
}

// eslint-disable-next-line react/no-unescaped-entities
// eslint-disable-next-line react-hooks/exhaustive-deps
