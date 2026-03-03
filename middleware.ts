import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Retry getUser() up to 3 times with delay (helps with cookie sync timing)
  let user = null
  for (let i = 0; i < 3; i++) {
    const { data } = await supabase.auth.getUser()
    user = data.user

    // Debug log - visible in Vercel runtime logs
    console.log(`Middleware attempt ${i + 1} for ${request.nextUrl.pathname} - user: ${user ? user.email : 'null'}`)

    if (user) break

    // Wait 300ms before next retry
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  // Protect all /admin/* routes
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    console.log('No user detected after retries - redirecting to login')
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
