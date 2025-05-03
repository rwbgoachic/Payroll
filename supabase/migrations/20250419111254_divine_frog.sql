/*
  # Blog System Schema Update

  1. Changes
    - Add blog_posts table if not exists
    - Add indexes for published_at and tags
    - Add RLS policies for public read and admin management
    - Add updated_at trigger

  2. Security
    - Enable RLS on blog_posts table
    - Public read access for all blog posts
    - Admin-only write access
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin(tags);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Blog posts are readable by everyone" ON blog_posts;
DROP POLICY IF EXISTS "Only admins can manage blog posts" ON blog_posts;

-- Add policies
CREATE POLICY "Blog posts are readable by everyone"
  ON blog_posts
  FOR SELECT
  TO public
  USING (true);

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
END $$;