/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (enum: user, moderator, admin)
      - `password_hash` (text, nullable for OAuth users)
      - `oauth_provider` (text, nullable)
      - `oauth_id` (text, nullable)
      - `reputation_score` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  password_hash text,
  oauth_provider text,
  oauth_id text,
  reputation_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text OR current_setting('app.current_user_role', true) IN ('moderator', 'admin'));

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text OR current_setting('app.current_user_role', true) = 'admin');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();