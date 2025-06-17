-- Create suggestion_cache table
CREATE TABLE IF NOT EXISTS public.suggestion_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  text_hash TEXT NOT NULL,
  text_content TEXT NOT NULL,
  suggestions JSONB NOT NULL DEFAULT '[]',
  version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(document_id, text_hash)
);

-- Enable RLS on suggestion_cache
ALTER TABLE public.suggestion_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy for suggestion_cache
CREATE POLICY "Users can view cache for own documents" ON public.suggestion_cache
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = suggestion_cache.document_id 
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cache for own documents" ON public.suggestion_cache
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = suggestion_cache.document_id 
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cache for own documents" ON public.suggestion_cache
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = suggestion_cache.document_id 
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cache for own documents" ON public.suggestion_cache
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = suggestion_cache.document_id 
      AND documents.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suggestion_cache_document_id ON public.suggestion_cache(document_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_cache_text_hash ON public.suggestion_cache(text_hash);
CREATE INDEX IF NOT EXISTS idx_suggestion_cache_expires_at ON public.suggestion_cache(expires_at);

-- Create composite index for better performance
CREATE INDEX IF NOT EXISTS idx_suggestion_cache_lookup ON public.suggestion_cache(document_id, text_hash, expires_at);

-- Create function to update last_used_at
CREATE OR REPLACE FUNCTION update_cache_last_used()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last_used_at updates
CREATE TRIGGER update_cache_last_used_trigger
  BEFORE UPDATE ON public.suggestion_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_cache_last_used();

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  -- Delete expired entries
  DELETE FROM public.suggestion_cache WHERE expires_at < NOW();
  
  -- Delete least recently used entries if cache size exceeds limit
  WITH cache_stats AS (
    SELECT COUNT(*) as total_entries,
           SUM(LENGTH(text_content::text) + LENGTH(suggestions::text)) as total_size
    FROM public.suggestion_cache
  )
  DELETE FROM public.suggestion_cache
  WHERE id IN (
    SELECT id FROM public.suggestion_cache
    ORDER BY last_used_at ASC
    LIMIT (
      SELECT CASE 
        WHEN total_size > 1000000000 THEN -- 1GB limit
          (SELECT COUNT(*) FROM public.suggestion_cache) * 0.2 -- Remove 20% of entries
        ELSE 0
      END
      FROM cache_stats
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired cache
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 0 * * *', -- Run daily at midnight
  'SELECT cleanup_expired_cache()'
);
