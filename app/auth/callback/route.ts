import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Callback hit - full URL:', request.url)
  console.log('Code present:', !!code)

  if (!code) {
    console.log('No code - redirect to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.next()

  const host = request.headers.get('host') || 'blve-console-pcvm.vercel.app'
  const domain = host.startsWith('www.') ? host.slice(4) : host

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
            const cookieOptions = {
              ...options,
              path: '/',
              domain: domain,
              sameSite: 'lax',
              secure: true,
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 7, // 7 days
            }
            response.cookies.set(name, value, cookieOptions)
            console.log(`Cookie set: ${name}, value length: ${value.length}, domain: ${cookieOptions.domain}, path: ${cookieOptions.path}`)
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

  console.log('Session created:', session ? 'success' : 'failed')
  console.log('User email:', session?.user?.email || 'none')
  console.log('Access token length:', session?.access_token?.length || 0)

  return NextResponse.redirect(new URL('/admin/dashboard', request.url))
}
