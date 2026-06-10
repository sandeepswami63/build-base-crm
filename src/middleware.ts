import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip session check for login/register pages - they don't need it
  // This prevents the browser from freezing when Supabase is slow
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
    return response
  }

  // Only check session for /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    try {
      // Add a timeout to prevent middleware from hanging indefinitely
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 10000)
      )

      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])

      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('Middleware session check failed:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}

