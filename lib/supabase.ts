import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TYPES FOR EXISTING TABLES (posts, etc.)
// ============================================================================

export type Post = {
  id: number;
  wp_id?: number | null;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string | null;
  published_at: string;
  updated_at?: string;
  post_type: 'post' | 'page';
};

export type StockKeyword = {
  id: number;
  stock_slug: string;
  keyword: string;
  section?: string | null;
};

// ============================================================================
// TYPES FOR STOCKS TABLE
// ============================================================================

export type Stock = {
  id: number;
  slug: string;               // e.g., "reliance-industries"
  name: string;               // e.g., "Reliance Industries"
  symbol: string;             // e.g., "RELIANCE"
  sector: string | null;
  industry?: string | null;
  market_cap: number | null;  // in crores or actual value
  current_price: number | null;
  pe_ratio: number | null;
  roe: number | null;
  roce: number | null;
  eps: number | null;
  dividend_yield: number | null;
  debt_to_equity: number | null;
  book_value?: number | null;
  face_value?: number | null;
  content: string | null;     // long analysis HTML
  excerpt: string | null;
  featured_image: string | null;
  // Price targets for different years (stored as strings but can be numbers)
  target_2025: string | null;
  target_2026: string | null;
  target_2027: string | null;
  target_2028: string | null;
  target_2030: string | null;
  target_2035: string | null;
  target_2040: string | null;
  target_2050: string | null;
  ai_summary: string | null;   // AI generated bull/bear summary
  last_updated: string;
  created_at: string;
};

// ============================================================================
// TYPES FOR STOCK_ARTICLES TABLE
// ============================================================================

export type StockArticle = {
  id: number;
  stock_slug: string;
  article_type: 'swot' | 'investment_thesis' | 'sector_outlook' | 'valuation';
  title: string;
  content: string;            // HTML or Markdown
  word_count: number | null;
  generated_at: string;
};

// ============================================================================
// TYPES FOR FINANCIAL TABLES (P&L, Balance Sheet, Quarterly Results, etc.)
// ============================================================================

export type ProfitLoss = {
  id: number;
  stock_slug: string;
  year: number;
  revenue_cr: number | null;
  net_profit_cr: number | null;
  ebitda_cr: number | null;
  net_margin_pct: number | null;
};

export type BalanceSheet = {
  id: number;
  stock_slug: string;
  year: number;
  total_debt_cr: number | null;
  debt_to_equity: number | null;
  current_ratio: number | null;
};

export type QuarterlyResult = {
  id: number;
  stock_slug: string;
  quarter: string;           // ISO date (YYYY-MM-DD)
  revenue_cr: number | null;
  profit_cr: number | null;
  eps: number | null;
};

export type Shareholding = {
  id: number;
  stock_slug: string;
  quarter: string;
  promoter_pct: number | null;
  fii_pct: number | null;
  dii_pct: number | null;
  public_pct: number | null;
};

export type DividendHistory = {
  id: number;
  stock_slug: string;
  ex_date: string;
  dividend_per_share: number | null;
  yield_pct: number | null;
};

export type PeBand = {
  id: number;
  stock_slug: string;
  year: number;
  min_pe: number | null;
  max_pe: number | null;
};

export type UpcomingEvent = {
  id: number;
  stock_slug: string;
  event_date: string;
  event_type: string;        // 'Board Meeting', 'Dividend', 'Earnings', 'AGM'
  description: string | null;
};

export type InstitutionalHolding = {
  id: number;
  stock_slug: string;
  institution_name: string;
  shares_held_cr: number | null;
  change_pct: number | null;
};

export type EsgScore = {
  id: number;
  stock_slug: string;
  esg_rating: string | null;   // 'AAA', 'AA', etc.
  environmental_score: number | null;
  social_score: number | null;
  governance_score: number | null;
};

// ============================================================================
// TYPES FOR PUSH SUBSCRIPTIONS
// ============================================================================

export type PushSubscription = {
  id: number;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
  user_agent?: string | null;
  browser?: string | null;
  platform?: string | null;
  country?: string | null;
  location_city?: string | null;
  tags?: string[] | null;
  subscribed_at: string;
  last_used: string;
  is_active: boolean;
};

// ============================================================================
// HELPER TYPES FOR DATABASE RESPONSES
// ============================================================================

export type Tables = {
  posts: Post;
  stocks: Stock;
  stock_keywords: StockKeyword;
  stock_articles: StockArticle;
  profit_loss: ProfitLoss;
  balance_sheet: BalanceSheet;
  quarterly_results: QuarterlyResult;
  shareholding: Shareholding;
  dividend_history: DividendHistory;
  pe_bands: PeBand;
  upcoming_events: UpcomingEvent;
  institutional_holdings: InstitutionalHolding;
  esg_scores: EsgScore;
  push_subscriptions: PushSubscription;
};

// ============================================================================
// HELPER FUNCTIONS (optional)
// ============================================================================

export async function getStockBySlug(slug: string): Promise<Stock | null> {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return data as Stock;
}

export async function getAllStocks(): Promise<Stock[]> {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .order('name', { ascending: true });
  if (error) return [];
  return data as Stock[];
}
