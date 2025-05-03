/*
  # Add blog comments functionality

  1. New Tables
    - `blog_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references blog_posts)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `likes` (integer)
      - `status` (text: published, pending, spam)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `blog_comments` table
    - Add policies for authenticated users to create comments
    - Add policies for admins to manage all comments
*/

-- Create blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes integer DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending', 'spam')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);

-- Enable RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Add policies
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
    WHERE tgname = 'update_blog_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_comments_updated_at
      BEFORE UPDATE ON blog_comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;