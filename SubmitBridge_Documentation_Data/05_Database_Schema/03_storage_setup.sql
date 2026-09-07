-- =============================================================================
-- SubmitBridge Storage Configuration — 03_storage_setup.sql
-- Sets up Supabase Storage bucket for student assignment uploads
-- =============================================================================

-- Create public storage bucket named 'submissions'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'submissions', 
    'submissions', 
    true, 
    10485760, -- 10 MB in bytes
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760;

-- Public read access policy for downloading/viewing student submissions
CREATE POLICY IF NOT EXISTS "Public Access for Submissions"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'submissions');

-- Backend Service Role upload policy
CREATE POLICY IF NOT EXISTS "Service Role Upload Access"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'submissions');

-- Backend Service Role update/delete policy for resubmission overwrites
CREATE POLICY IF NOT EXISTS "Service Role Delete and Overwrite Access"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'submissions');
