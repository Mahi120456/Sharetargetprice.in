import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Existing Blog Post Types ---
export type Post = {
  id: number
  wp_id: number
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string | null
  category: string | null
  published_at: string
  post_type: string
}

// --- New Stock Automation Types ---
export type Stock = {
  id: string
  slug: string
  name: string
  symbol: string
  sector: string | null
  market_cap: string | null
  pe_ratio: string | null
  target_2025: number
  target_2030: number
  target_2040: number
  target_2050: number
  ai_analysis: string | null
  created_at: string
}

export type StockArticle = {
  id: number
  stock_slug: string
  title: string
  category: string
  content: string
}
