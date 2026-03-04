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
          console.log('Callback setting', cookiesToSet.length, 'cookies')
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              path: '/',
              domain: request.headers.get('host')?.split(':')[0], // explicit domain
              sameSite: 'lax',
              secure: true,
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 7, // 7 days
            })
            console.log('Set cookie:', name, 'value length:', value.length)
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

  console.log('Session created in callback:', session ? 'success' : 'failed', 'User:', session?.user?.email || 'none')

  return NextResponse.redirect(new URL('/admin/dashboard', request.url))
}
