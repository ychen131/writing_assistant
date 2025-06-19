// supabase/functions/cleanup_document_versions/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const MAX_AUTO_SAVED_VERSIONS = 10
const BATCH_SIZE = 100 // Process documents in batches for better performance

serve(async (req) => {
  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        }
      }
    )

    let totalDeleted = 0
    let processedDocs = 0
    let hasMore = true
    let lastDocId: string | null = null

    // Process documents in batches
    while (hasMore) {
      // Get batch of documents
      const query = supabaseClient
        .from('documents')
        .select('id')
        .order('id')
        .limit(BATCH_SIZE)

      if (lastDocId) {
        query.gt('id', lastDocId)
      }

      const { data: documents, error: docError } = await query

      if (docError) {
        console.error('Error fetching documents:', docError)
        throw docError
      }

      if (!documents || documents.length === 0) {
        hasMore = false
        continue
      }

      // Process each document in the batch
      for (const doc of documents) {
        try {
          // Get unpinned, auto-saved versions for this document
          const { data: versions, error: verError } = await supabaseClient
            .from('document_versions')
            .select('id, created_at')
            .eq('document_id', doc.id)
            .eq('is_pinned', false)
            .eq('is_auto_save', true)
            .order('created_at', { ascending: false })

          if (verError) {
            console.error(`Error fetching versions for document ${doc.id}:`, verError)
            continue
          }

          if (versions && versions.length > MAX_AUTO_SAVED_VERSIONS) {
            const toDelete = versions.slice(MAX_AUTO_SAVED_VERSIONS).map(v => v.id)
            
            if (toDelete.length > 0) {
              const { error: delError } = await supabaseClient
                .from('document_versions')
                .delete()
                .in('id', toDelete)

              if (delError) {
                console.error(`Error deleting versions for document ${doc.id}:`, delError)
              } else {
                totalDeleted += toDelete.length
              }
            }
          }

          processedDocs++
          lastDocId = doc.id
        } catch (err) {
          console.error(`Error processing document ${doc.id}:`, err)
          continue // Continue with next document even if one fails
        }
      }
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        message: `Cleanup complete. Processed ${processedDocs} documents and deleted ${totalDeleted} old auto-saved versions.`,
        processedDocs,
        totalDeleted
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (err) {
    console.error('Fatal error:', err)
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Internal server error during cleanup',
        error: err.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})