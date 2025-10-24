import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Return null if credentials are not configured
  if (!url || !key || url.trim() === '' || key.trim() === '') {
    console.warn('[Supabase] Credentials not configured. Google OAuth will not be available.')
    return null
  }
  
  return createBrowserClient(url, key)
}
