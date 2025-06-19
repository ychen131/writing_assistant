// hooks/use-document-versions.ts

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDebounce } from '@/hooks/use-debounce'

interface UseDocumentVersionsProps {
  documentId: string
  onVersionCreate?: () => void
  onVersionRestore?: (content: string) => void
}

export function useDocumentVersions({ 
  documentId, 
  onVersionCreate, 
  onVersionRestore 
}: UseDocumentVersionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [versions, setVersions] = useState<any[]>([])
  const supabase = createClient()

  // Fetch versions
  const fetchVersions = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVersions(data || [])
    } catch (error) {
      console.error('Error fetching versions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [documentId, supabase])

  // Create a new version
  const createVersion = useCallback(async (plainTextContent: string, isPinned = false, description?: string) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('No authenticated user found')

      const { error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          plain_text_content: plainTextContent,
          user_id: user.id,
          is_pinned: isPinned,
          is_auto_save: !isPinned,
          description
        })

      if (error) throw error
      onVersionCreate?.()
      await fetchVersions()
    } catch (error) {
      console.error('Error creating version:', error)
    }
  }, [documentId, supabase, onVersionCreate, fetchVersions])

  // Restore a version
  const restoreVersion = useCallback(async (versionId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('plain_text_content')
        .eq('id', versionId)
        .single()

      if (error) throw error
      if (data) {
        onVersionRestore?.(data.plain_text_content)
      }
    } catch (error) {
      console.error('Error restoring version:', error)
    }
  }, [supabase, onVersionRestore])

  // Delete a version
  const deleteVersion = useCallback(async (versionId: string) => {
    try {
      const { error } = await supabase
        .from('document_versions')
        .delete()
        .eq('id', versionId)

      if (error) throw error
      await fetchVersions()
    } catch (error) {
      console.error('Error deleting version:', error)
    }
  }, [supabase, fetchVersions])

  return {
    versions,
    isLoading,
    fetchVersions,
    createVersion,
    restoreVersion,
    deleteVersion
  }
}