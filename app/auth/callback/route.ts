// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Callback hit - URL:', requestUrl.toString())
  console.log('Code present:', !!code)

  if (!code) {
    console.log('No code provided - redirecting to login')
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  console.log('Exchanging code for session...')

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Session exchange failed:', error.message)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }

  console.log('Session created successfully')
  console.log('User email:', session?.user?.email || 'none')
  console.log('Access token length:', session?.access_token?.length || 0)

  // Redirect to dashboard
  const redirectUrl = new URL('/admin/dashboard', request.url)
  return NextResponse.redirect(redirectUrl)
}