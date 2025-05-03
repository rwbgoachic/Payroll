/*
  # Add Chatbot Support Tables

  1. New Tables
    - `chat_messages` - Stores chat history between users and the AI assistant
    - `chat_sessions` - Tracks chat sessions
    - `chat_feedback` - Stores user feedback on AI responses

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  system text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  is_bot boolean NOT NULL DEFAULT false,
  system text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create chat_feedback table
CREATE TABLE IF NOT EXISTS chat_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_message_id ON chat_feedback(message_id);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

-- Add policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own chat sessions"
  ON chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can create chat sessions"
  ON chat_sessions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Add policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert their own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anonymous users can view and insert chat messages"
  ON chat_messages
  FOR ALL
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

-- Add policies for chat_feedback
CREATE POLICY "Users can view their own feedback"
  ON chat_feedback
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own feedback"
  ON chat_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can provide feedback"
  ON chat_feedback
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Add triggers for updating updated_at
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get chat history
CREATE OR REPLACE FUNCTION get_chat_history(p_session_id uuid)
RETURNS TABLE (
  id uuid,
  message text,
  is_bot boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.message,
    cm.is_bot,
    cm.created_at
  FROM 
    chat_messages cm
  WHERE 
    cm.session_id = p_session_id
  ORDER BY 
    cm.created_at ASC;
END;
$$ LANGUAGE plpgsql;