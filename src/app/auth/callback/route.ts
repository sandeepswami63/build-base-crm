import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.headers.get('cookie')?.match(new RegExp(`(^| )${name}=([^;]+)`))?.[2]
          },
          set(name: string, value: string, options: CookieOptions) {
            // we omit because we handle cookies globally in middleware if needed, but next.js
            // SSR auth flow sometimes requires setting it here:
          },
          remove(name: string, options: CookieOptions) {
          },
        },
      }
    )
    
    // We are just exchanging the code for a session.
    // Full cookie management is better done using the modern route handler approach:
    
    const cookieStore = require('next/headers').cookies()
    const supabaseWithCookies = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabaseWithCookies.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`https://crm.buildbasedigitally.com${next}`)
    } else {
      console.error('Code exchange error:', error)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`https://crm.buildbasedigitally.com/login?error=InvalidAuthCode`)
}
