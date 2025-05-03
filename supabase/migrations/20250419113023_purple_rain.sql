-- Add status and scheduling columns to blog_posts
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'
  CHECK (status IN ('draft', 'published')),
ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

-- Create index for status and scheduling
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled ON blog_posts(scheduled_for)
  WHERE status = 'draft' AND scheduled_for IS NOT NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Blog posts are readable by everyone" ON blog_posts;
CREATE POLICY "Published blog posts are readable by everyone"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published' AND (scheduled_for IS NULL OR scheduled_for <= now()));