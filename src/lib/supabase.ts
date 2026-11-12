import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * null until .env.local is filled in. The starter runs on localStorage
 * (see store/StoreContext.tsx); Phase 2 of docs/BUILD_PLAN.md switches to this client.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null
