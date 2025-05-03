/*
  # Blog System Setup

  1. Tables
    - blog_posts: Main table for blog content
    - blog_comments: User comments on blog posts

  2. Security
    - Enable RLS on all tables
    - Add policies for public and authenticated access
    - Add policies for admin management

  3. Indexes
    - Optimize queries with appropriate indexes
*/

-- Create blog posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  author text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  tags text[] DEFAULT '{}',
  source text,
  source_url text,
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  scheduled_for timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes integer DEFAULT 0,
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'pending', 'spam')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled ON blog_posts(scheduled_for)
  WHERE status = 'draft' AND scheduled_for IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Published blog posts are readable by everyone" ON blog_posts;
  DROP POLICY IF EXISTS "Only admins can manage blog posts" ON blog_posts;
  DROP POLICY IF EXISTS "Comments are readable by everyone" ON blog_comments;
  DROP POLICY IF EXISTS "Authenticated users can create comments" ON blog_comments;
  DROP POLICY IF EXISTS "Users can update their own comments" ON blog_comments;
  DROP POLICY IF EXISTS "Users can delete their own comments" ON blog_comments;
  DROP POLICY IF EXISTS "Admins can manage all comments" ON blog_comments;
END $$;

-- Add policies for blog posts
CREATE POLICY "Published blog posts are readable by everyone"
  ON blog_posts
  FOR SELECT
  TO public
  USING (
    status = 'published' AND 
    (scheduled_for IS NULL OR scheduled_for <= now())
  );

CREATE POLICY "Only admins can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

-- Add policies for blog comments
CREATE POLICY "Comments are readable by everyone"
  ON blog_comments
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Authenticated users can create comments"
  ON blog_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON blog_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON blog_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
  ON blog_comments
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

-- Create or replace function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON blog_comments;

-- Create triggers
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();