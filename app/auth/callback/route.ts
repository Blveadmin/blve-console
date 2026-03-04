import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Callback hit - code:', code ? 'present' : 'missing')

  if (!code) {
    console.log('No code - redirect to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          console.log('Setting', cookiesToSet.length, 'cookies in callback')
          cookiesToSet.forEach(({ name, value, options }) => {
            // Explicit flags for cross-site reliability
            response.cookies.set(name, value, {
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: true,
              httpOnly: true,
            })
            console.log('Cookie set:', name, 'length:', value.length)
          })
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Exchange error:', error.message)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }

  console.log('Session created:', session ? 'success' : 'failed', 'User:', session?.user?.email || 'none')

  // Force redirect to admin
  return NextResponse.redirect(new URL('/admin/dashboard', request.url))
}