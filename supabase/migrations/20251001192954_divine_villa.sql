/*
  # Create communities table

  1. New Tables
    - `communities`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, nullable)
      - `rules` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `communities` table
    - Add policies for admin access
*/

CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text,
  rules jsonb NOT NULL DEFAULT '{
    "auto_remove_threshold": 0.9,
    "flag_review_threshold": 0.6,
    "allowed_categories": ["spam", "harassment", "hate-speech", "violence", "nudity", "misinformation", "copyright", "other"],
    "max_post_length": 2000,
    "allow_anonymous_posts": false,
    "require_approval": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_communities_name ON communities(name);
CREATE INDEX IF NOT EXISTS idx_communities_rules ON communities USING gin(rules);

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read communities"
  ON communities
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage communities"
  ON communities
  FOR ALL
  USING (current_setting('app.current_user_role', true) = 'admin');

-- Update timestamp trigger
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default community
INSERT INTO communities (name, description) VALUES 
('General', 'Default community for all posts')
ON CONFLICT (name) DO NOTHING;