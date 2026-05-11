-- =============================================
-- sharetargetprice.in - Complete Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- ========== 1. EXISTING POSTS & SETTINGS ==========
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

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read posts" ON posts FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'ShareTargetPrice.in'),
  ('site_description', 'Share Price Target Analysis - Stock Market Insights'),
  ('adsense_client', 'YOUR_ADSENSE_CLIENT_ID')
ON CONFLICT (key) DO NOTHING;

-- ========== 2. STOCKS TABLE (3000+ stocks) ==========
CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  sector TEXT,
  industry TEXT,
  market_cap BIGINT,
  current_price DECIMAL(10,2),
  pe_ratio DECIMAL(8,2),
  roe DECIMAL(5,2),
  roce DECIMAL(5,2),
  eps DECIMAL(10,2),
  dividend_yield DECIMAL(5,2),
  debt_to_equity DECIMAL(5,2),
  book_value DECIMAL(10,2),
  face_value DECIMAL(10,2),
  target_2025 TEXT,
  target_2026 TEXT,
  target_2027 TEXT,
  target_2028 TEXT,
  target_2030 TEXT,
  target_2035 TEXT,
  target_2040 TEXT,
  target_2050 TEXT,
  content TEXT,               -- long HTML analysis
  excerpt TEXT,
  featured_image TEXT,
  ai_summary TEXT,            -- AI generated bull/bear summary
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stocks_slug ON stocks(slug);
CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_stocks_sector ON stocks(sector);
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read stocks" ON stocks FOR SELECT USING (true);

-- ========== 3. STOCK KEYWORDS (SEO) ==========
CREATE TABLE IF NOT EXISTS stock_keywords (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_intent TEXT,
  UNIQUE(stock_slug, keyword)
);
CREATE INDEX idx_stock_keywords_stock ON stock_keywords(stock_slug);
ALTER TABLE stock_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read stock_keywords" ON stock_keywords FOR SELECT USING (true);

-- ========== 4. AI ARTICLES (SWOT, Thesis, etc.) ==========
CREATE TABLE IF NOT EXISTS stock_articles (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  article_type TEXT CHECK (article_type IN ('swot', 'investment_thesis', 'sector_outlook', 'valuation')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_stock_articles_stock ON stock_articles(stock_slug);
ALTER TABLE stock_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read stock_articles" ON stock_articles FOR SELECT USING (true);

-- ========== 5. FINANCIAL TABLES ==========
CREATE TABLE IF NOT EXISTS profit_loss (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  year INTEGER,
  revenue_cr DECIMAL(15,2),
  net_profit_cr DECIMAL(15,2),
  ebitda_cr DECIMAL(15,2),
  net_margin_pct DECIMAL(5,2),
  UNIQUE(stock_slug, year)
);
CREATE INDEX idx_pl_stock ON profit_loss(stock_slug);

CREATE TABLE IF NOT EXISTS balance_sheet (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  year INTEGER,
  total_debt_cr DECIMAL(15,2),
  debt_to_equity DECIMAL(5,2),
  current_ratio DECIMAL(5,2),
  UNIQUE(stock_slug, year)
);
CREATE INDEX idx_bs_stock ON balance_sheet(stock_slug);

CREATE TABLE IF NOT EXISTS quarterly_results (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  quarter DATE,
  revenue_cr DECIMAL(15,2),
  profit_cr DECIMAL(15,2),
  eps DECIMAL(8,2),
  UNIQUE(stock_slug, quarter)
);
CREATE INDEX idx_qr_stock ON quarterly_results(stock_slug);
CREATE INDEX idx_qr_quarter ON quarterly_results(quarter DESC);

CREATE TABLE IF NOT EXISTS shareholding (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  quarter DATE,
  promoter_pct DECIMAL(5,2),
  fii_pct DECIMAL(5,2),
  dii_pct DECIMAL(5,2),
  public_pct DECIMAL(5,2),
  UNIQUE(stock_slug, quarter)
);
CREATE INDEX idx_sh_stock ON shareholding(stock_slug);

CREATE TABLE IF NOT EXISTS dividend_history (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  ex_date DATE,
  dividend_per_share DECIMAL(10,2),
  yield_pct DECIMAL(5,2)
);
CREATE INDEX idx_div_stock ON dividend_history(stock_slug);
CREATE INDEX idx_div_date ON dividend_history(ex_date DESC);

CREATE TABLE IF NOT EXISTS pe_bands (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  year INTEGER,
  min_pe DECIMAL(8,2),
  max_pe DECIMAL(8,2),
  UNIQUE(stock_slug, year)
);
CREATE INDEX idx_pe_stock ON pe_bands(stock_slug);

CREATE TABLE IF NOT EXISTS upcoming_events (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  event_date DATE,
  event_type TEXT,
  description TEXT
);
CREATE INDEX idx_events_stock ON upcoming_events(stock_slug);
CREATE INDEX idx_events_date ON upcoming_events(event_date);

CREATE TABLE IF NOT EXISTS institutional_holdings (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  institution_name TEXT,
  shares_held_cr DECIMAL(10,2),
  change_pct DECIMAL(5,2)
);
CREATE INDEX idx_inst_stock ON institutional_holdings(stock_slug);

CREATE TABLE IF NOT EXISTS esg_scores (
  id SERIAL PRIMARY KEY,
  stock_slug TEXT REFERENCES stocks(slug) ON DELETE CASCADE,
  esg_rating TEXT,
  environmental_score INTEGER,
  social_score INTEGER,
  governance_score INTEGER
);
CREATE INDEX idx_esg_stock ON esg_scores(stock_slug);

-- ========== 6. PUSH NOTIFICATIONS ==========
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  browser TEXT,
  platform TEXT,
  country TEXT,
  location_city TEXT,
  tags TEXT[] DEFAULT '{}',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
CREATE INDEX idx_push_endpoint ON push_subscriptions(endpoint);
CREATE INDEX idx_push_browser ON push_subscriptions(browser);
CREATE INDEX idx_push_platform ON push_subscriptions(platform);
CREATE INDEX idx_push_active ON push_subscriptions(is_active);
CREATE INDEX idx_push_tags ON push_subscriptions USING GIN(tags);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own subscription" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their own subscription" ON push_subscriptions FOR DELETE USING (true);
-- Admin can see all (use service role key in API)

-- =============================================
-- ✅ Schema Upgrade Complete
-- =============================================
