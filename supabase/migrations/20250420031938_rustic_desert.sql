/*
  # Add blog functionality

  1. New Tables
    - blog_posts: Stores blog posts with scheduling support
    - blog_comments: Stores user comments on blog posts

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing posts/comments
*/

-- Create blog posts table if it doesn't exist
DO $$ BEGIN
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
    updated_at timestamptz DEFAULT now(),
    status text NOT NULL DEFAULT 'published'
      CHECK (status IN ('draft', 'published')),
    scheduled_for timestamptz
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create blog comments table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS blog_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    likes integer DEFAULT 0,
    status text NOT NULL DEFAULT 'published'
      CHECK (status IN ('published', 'pending', 'spam')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin(tags);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled ON blog_posts(scheduled_for) 
    WHERE status = 'draft' AND scheduled_for IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
  CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON blog_comments(user_id);
  CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Published blog posts are readable by everyone" ON blog_posts;
  DROP POLICY IF EXISTS "Only admins can manage blog posts" ON blog_posts;
  DROP POLICY IF EXISTS "Comments are readable by everyone" ON blog_comments;
  DROP POLICY IF EXISTS "Authenticated users can create comments" ON blog_comments;
  DROP POLICY IF EXISTS "Users can update their own comments" ON blog_comments;
  DROP POLICY IF EXISTS "Users can delete their own comments" ON blog_comments;
  DROP POLICY IF EXISTS "Admins can manage all comments" ON blog_comments;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Add policies for blog_posts
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

-- Add policies for blog_comments
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

-- Drop existing triggers if they exist
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
  DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON blog_comments;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Add triggers for updating updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample blog posts if they don't exist
INSERT INTO blog_posts (
  title,
  content,
  excerpt,
  author,
  tags,
  status
)
SELECT
  'Understanding Payroll Taxes in 2025',
  E'# Understanding Payroll Taxes in 2025\n\nPayroll taxes are a crucial part of employment and running a business. Let''s break down the key changes for 2025.\n\n## Federal Income Tax\nThe IRS has announced new tax brackets for 2025...',
  'A comprehensive guide to payroll tax changes and requirements for 2025',
  'Sarah Connor',
  ARRAY['payroll', 'taxes', 'compliance'],
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE title = 'Understanding Payroll Taxes in 2025'
);

INSERT INTO blog_posts (
  title,
  content,
  excerpt,
  author,
  tags,
  status
)
SELECT
  'Best Practices for Employee Benefits Management',
  E'# Best Practices for Employee Benefits Management\n\nEffective benefits management is key to employee satisfaction and retention. Here are the top strategies...',
  'Learn how to optimize your employee benefits program',
  'John Smith',
  ARRAY['benefits', 'hr', 'management'],
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE title = 'Best Practices for Employee Benefits Management'
);

INSERT INTO blog_posts (
  title,
  content,
  excerpt,
  author,
  tags,
  status
)
SELECT
  'The Future of Payroll Technology',
  E'# The Future of Payroll Technology\n\nAs we move towards more automated and intelligent systems, payroll technology is evolving rapidly...',
  'Exploring upcoming trends and innovations in payroll technology',
  'Emily Zhang',
  ARRAY['technology', 'automation', 'future'],
  'draft'
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE title = 'The Future of Payroll Technology'
);