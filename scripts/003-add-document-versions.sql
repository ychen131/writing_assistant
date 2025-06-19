CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_auto_save BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON public.document_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_is_pinned ON public.document_versions(is_pinned);

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_versions
CREATE POLICY "Users can view versions of their own documents" ON public.document_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = document_versions.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create versions for their own documents" ON public.document_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = document_versions.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete versions of their own documents" ON public.document_versions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = document_versions.document_id
            AND documents.user_id = auth.uid()
        )
    );