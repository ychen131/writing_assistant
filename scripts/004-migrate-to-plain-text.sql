-- Migration script to convert from JSON-based content to plain text as source of truth
-- This script adds plain_text_content column and migrates existing data

-- Step 1: Add plain_text_content column to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS plain_text_content TEXT DEFAULT '';

-- Step 2: Add plain_text_content column to document_versions table
ALTER TABLE public.document_versions 
ADD COLUMN IF NOT EXISTS plain_text_content TEXT DEFAULT '';

-- Step 3: Create function to extract plain text from Lexical JSON
CREATE OR REPLACE FUNCTION extract_plain_text_from_lexical(json_content JSONB)
RETURNS TEXT AS $$
DECLARE
    plain_text TEXT := '';
    root_node JSONB;
    children JSONB;
    child JSONB;
BEGIN
    -- Handle null or empty content
    IF json_content IS NULL OR json_content = '{}'::jsonb THEN
        RETURN '';
    END IF;

    -- Get the root node
    root_node := json_content->'root';
    IF root_node IS NULL THEN
        RETURN '';
    END IF;

    -- Get children of root
    children := root_node->'children';
    IF children IS NULL THEN
        RETURN '';
    END IF;

    -- Recursively extract text from all nodes
    FOR i IN 0..jsonb_array_length(children)-1 LOOP
        child := children->i;
        plain_text := plain_text || extract_text_from_node(child);
    END LOOP;

    RETURN trim(plain_text);
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create function to extract text from individual nodes
CREATE OR REPLACE FUNCTION extract_text_from_node(node JSONB)
RETURNS TEXT AS $$
DECLARE
    node_text TEXT := '';
    node_type TEXT;
    node_children JSONB;
    node_format JSONB;
    child JSONB;
    text_content TEXT;
BEGIN
    -- Get node type
    node_type := node->>'type';
    
    -- Handle text nodes
    IF node_type = 'text' THEN
        text_content := node->>'text';
        IF text_content IS NOT NULL THEN
            node_text := node_text || text_content;
        END IF;
        RETURN node_text;
    END IF;

    -- Handle element nodes with children
    node_children := node->'children';
    IF node_children IS NOT NULL THEN
        FOR i IN 0..jsonb_array_length(node_children)-1 LOOP
            child := node_children->i;
            node_text := node_text || extract_text_from_node(child);
        END LOOP;
    END IF;

    -- Add line breaks for block-level elements
    IF node_type IN ('paragraph', 'heading', 'listitem', 'quote') THEN
        node_text := node_text || E'\n';
    END IF;

    RETURN node_text;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Migrate existing document content to plain text
UPDATE public.documents 
SET plain_text_content = extract_plain_text_from_lexical(content)
WHERE plain_text_content = '' OR plain_text_content IS NULL;

-- Step 6: Migrate existing document versions to plain text
UPDATE public.document_versions 
SET plain_text_content = extract_plain_text_from_lexical(content)
WHERE plain_text_content = '' OR plain_text_content IS NULL;

-- Step 7: Make plain_text_content NOT NULL after migration
ALTER TABLE public.documents 
ALTER COLUMN plain_text_content SET NOT NULL;

ALTER TABLE public.document_versions 
ALTER COLUMN plain_text_content SET NOT NULL;

-- Step 8: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_plain_text_content ON public.documents(plain_text_content);
CREATE INDEX IF NOT EXISTS idx_document_versions_plain_text_content ON public.document_versions(plain_text_content);

-- Step 9: Update the updated_at trigger to also update last_opened_at when plain_text_content changes
CREATE OR REPLACE FUNCTION update_document_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Update last_opened_at if content changed
    IF OLD.plain_text_content IS DISTINCT FROM NEW.plain_text_content THEN
        NEW.last_opened_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the old trigger and create the new one
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_timestamps 
    BEFORE UPDATE ON public.documents
    FOR EACH ROW 
    EXECUTE FUNCTION update_document_timestamps();

-- Step 10: Clean up old functions (optional - can be done later)
-- DROP FUNCTION IF EXISTS extract_plain_text_from_lexical(JSONB);
-- DROP FUNCTION IF EXISTS extract_text_from_node(JSONB);