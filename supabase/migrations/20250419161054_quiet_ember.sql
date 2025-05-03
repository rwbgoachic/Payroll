/*
  # Blog System Schema

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text)
      - `author` (text)
      - `published_at` (timestamptz)
      - `tags` (text[])
      - `source` (text)
      - `source_url` (text)
      - `status` (text)
      - `scheduled_for` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `blog_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references blog_posts)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `likes` (integer)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for post and comment management
    - Add policies for public access to published content

  3. Performance
    - Add indexes for common query patterns
    - Add triggers for updated_at timestamps
*/

-- Create blog posts table
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

-- Create blog comments table
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

-- Create indexes
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

-- Add trigger for updating updated_at timestamp
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_blog_posts_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_posts_updated_at
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_blog_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_comments_updated_at
      BEFORE UPDATE ON blog_comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;