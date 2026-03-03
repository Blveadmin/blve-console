import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Callback route hit - code:', code ? 'present' : 'missing')

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
          console.log('Callback setting', cookiesToSet.length, 'cookies')
          cookiesToSet.forEach(({ name, value, options }) => {
            // Force explicit cookie settings for reliability
            response.cookies.set(name, value, {
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: true, // must be true in production (HTTPS)
              httpOnly: true,
            })
            console.log('Set cookie:', name, 'length:', value.length)
          })
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Exchange code error:', error.message)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }

  console.log('Session created in callback:', session ? 'success' : 'failed')
  console.log('User email:', session?.user?.email || 'none')

  const redirectUrl = new URL('/admin/dashboard', request.url)
  return NextResponse.redirect(redirectUrl)
}
