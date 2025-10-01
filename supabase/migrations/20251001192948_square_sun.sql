/*
  # Create ai_analysis table

  1. New Tables
    - `ai_analysis`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `type` (enum: text, image)
      - `raw_response` (jsonb)
      - `labels` (text array)
      - `scores` (jsonb)
      - `overall_risk` (float)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `ai_analysis` table
    - Add policies for moderator access
*/

CREATE TYPE analysis_type AS ENUM ('text', 'image');

CREATE TABLE IF NOT EXISTS ai_analysis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type analysis_type NOT NULL,
  raw_response jsonb NOT NULL,
  labels text[] NOT NULL DEFAULT '{}',
  scores jsonb NOT NULL,
  overall_risk float NOT NULL CHECK (overall_risk >= 0 AND overall_risk <= 1),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_analysis_post_id ON ai_analysis(post_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis(type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_overall_risk ON ai_analysis(overall_risk DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON ai_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_labels ON ai_analysis USING gin(labels);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_scores ON ai_analysis USING gin(scores);

-- Enable RLS
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Moderators can read AI analysis"
  ON ai_analysis
  FOR SELECT
  USING (current_setting('app.current_user_role', true) IN ('moderator', 'admin'));

CREATE POLICY "System can create AI analysis"
  ON ai_analysis
  FOR INSERT
  WITH CHECK (true); -- Allow system to create analysis