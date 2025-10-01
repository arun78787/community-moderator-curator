/*
  # Create moderation_logs table

  1. New Tables
    - `moderation_logs`
      - `id` (uuid, primary key)
      - `moderator_id` (uuid, foreign key to users)
      - `flag_id` (uuid, foreign key to flags)
      - `action` (enum: approve, remove, escalate)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `moderation_logs` table
    - Add policies for moderator access
*/

CREATE TYPE moderation_action AS ENUM ('approve', 'remove', 'escalate');

CREATE TABLE IF NOT EXISTS moderation_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flag_id uuid NOT NULL REFERENCES flags(id) ON DELETE CASCADE,
  action moderation_action NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator_id ON moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_flag_id ON moderation_logs(flag_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action ON moderation_logs(action);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at DESC);

-- Enable RLS
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Moderators can create logs"
  ON moderation_logs
  FOR INSERT
  WITH CHECK (current_setting('app.current_user_role', true) IN ('moderator', 'admin'));

CREATE POLICY "Moderators can read logs"
  ON moderation_logs
  FOR SELECT
  USING (current_setting('app.current_user_role', true) IN ('moderator', 'admin'));