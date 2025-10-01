/*
  # Create posts table

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `author_id` (uuid, foreign key to users)
      - `content` (text)
      - `media_url` (text, nullable)
      - `status` (enum: active, removed, pending)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `posts` table
    - Add policies for CRUD operations
*/

CREATE TYPE post_status AS ENUM ('active', 'removed', 'pending');

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_url text,
  status post_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('english', content));

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active posts"
  ON posts
  FOR SELECT
  USING (status = 'active' OR current_setting('app.current_user_role', true) IN ('moderator', 'admin'));

CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  USING (auth.uid()::text = author_id::text OR current_setting('app.current_user_role', true) IN ('moderator', 'admin'));

CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  USING (auth.uid()::text = author_id::text OR current_setting('app.current_user_role', true) = 'admin');

-- Update timestamp trigger
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();