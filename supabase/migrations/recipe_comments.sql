-- Recipe Comments table for BimaSorgum
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS recipe_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  avatar_url TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES recipe_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by recipe
CREATE INDEX IF NOT EXISTS idx_recipe_comments_recipe_id ON recipe_comments(recipe_id);
-- Index for nested replies
CREATE INDEX IF NOT EXISTS idx_recipe_comments_parent_id ON recipe_comments(parent_id);

-- RLS: anyone can read, only authenticated users can insert/update/delete their own
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;

-- Read: anyone (including anon)
CREATE POLICY "Comments are readable by everyone"
  ON recipe_comments FOR SELECT
  USING (true);

-- Insert: any authenticated user (including anon with stable id)
CREATE POLICY "Users can insert their own comments"
  ON recipe_comments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Update: only own comments
CREATE POLICY "Users can update their own comments"
  ON recipe_comments FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Delete: only own comments
CREATE POLICY "Users can delete their own comments"
  ON recipe_comments FOR DELETE
  USING (auth.uid()::text = user_id);
