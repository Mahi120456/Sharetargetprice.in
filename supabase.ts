import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
