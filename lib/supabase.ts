import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type for subscription from database
export interface Subscription {
  id: number
  service_name: string
  monthly_cost: number
  renewal_date: string
  status: 'active' | 'cancelled'
  icon: string
  user_id: string | null
  created_at: string
  updated_at: string
}
