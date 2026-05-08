-- =============================================
-- sharetargetprice.in - Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  wp_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT DEFAULT 'Share Price Target',
  post_type TEXT DEFAULT 'post',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookup
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read posts"
  ON posts FOR SELECT
  USING (true);

-- Site settings table (optional)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'ShareTargetPrice.in'),
  ('site_description', 'Share Price Target Analysis - Stock Market Insights'),
  ('adsense_client', 'YOUR_ADSENSE_CLIENT_ID')
ON CONFLICT (key) DO NOTHING;
