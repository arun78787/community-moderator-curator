/*
  # Create flags table

  1. New Tables
    - `flags`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `flagged_by` (uuid, foreign key to users)
      - `reason_category` (enum)
      - `reason_text` (text, nullable)
      - `status` (enum: pending, approved, removed, escalated)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `flags` table
    - Add policies for flagging and moderation
*/

CREATE TYPE flag_reason AS ENUM ('spam', 'harassment', 'hate-speech', 'violence', 'nudity', 'misinformation', 'copyright', 'other');
CREATE TYPE flag_status AS ENUM ('pending', 'approved', 'removed', 'escalated');

CREATE TABLE IF NOT EXISTS flags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  flagged_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason_category flag_reason NOT NULL,
  reason_text text,
  status flag_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flags_post_id ON flags(post_id);
CREATE INDEX IF NOT EXISTS idx_flags_flagged_by ON flags(flagged_by);
CREATE INDEX IF NOT EXISTS idx_flags_status ON flags(status);
CREATE INDEX IF NOT EXISTS idx_flags_created_at ON flags(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flags_reason_category ON flags(reason_category);

-- Unique constraint to prevent duplicate flags from same user on same post
CREATE UNIQUE INDEX IF NOT EXISTS idx_flags_unique_user_post ON flags(post_id, flagged_by);

-- Enable RLS
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create flags"
  ON flags
  FOR INSERT
  WITH CHECK (auth.uid()::text = flagged_by::text);

CREATE POLICY "Users can read own flags"
  ON flags
  FOR SELECT
  USING (auth.uid()::text = flagged_by::text OR current_setting('app.current_user_role', true) IN ('moderator', 'admin'));

CREATE POLICY "Moderators can update flags"
  ON flags
  FOR UPDATE
  USING (current_setting('app.current_user_role', true) IN ('moderator', 'admin'));

-- Update timestamp trigger
CREATE TRIGGER update_flags_updated_at BEFORE UPDATE ON flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();