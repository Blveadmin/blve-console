'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Single Supabase client instance
  const supabaseRef = useRef<any>(null)
  if (!supabaseRef.current) {
    supabaseRef.current = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  const supabase = supabaseRef.current

  useEffect(() => {
    console.log('Login page mounted - starting session check')

    const redirectPath = searchParams.get('redirect') || '/admin/dashboard'
    console.log('Redirect target from query:', redirectPath)

    if (window.location.hash) {
      console.log('Clearing callback hash fragment')
      window.location.hash = ''
    }

    const checkSession = async () => {
      for (let attempt = 1; attempt <= 4; attempt++) {
        const response = await supabase.auth.getSession()
        const session = response.data.session
        const error = response.error

        console.log(`Session check attempt ${attempt}:`, {
          hasSession: !!session,
          sessionUser: session?.user?.email || 'none',
          accessTokenLength: session?.access_token?.length || 0,
          error: error?.message || 'no error'
        })

        if (session) {
          console.log('Session FOUND on attempt ' + attempt + ' - redirecting to:', redirectPath)
          setTimeout(() => {
            router.replace(redirectPath)
            window.location.href = redirectPath // fallback full reload
          }, 500)
          return
        }

        await new Promise(r => setTimeout(r, 400))
      }

      console.log('No session after all retries - showing login UI')
      setLoading(false)
    }

    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', {
          event,
          hasSession: !!session,
          user: session?.user?.email || 'none'
        })
        if (session) {
          console.log('Listener detected session - redirecting')
          setTimeout(() => {
            router.replace(redirectPath)
            window.location.href = redirectPath
          }, 500)
        }
      }
    )

    return () => {
      console.log('Cleaning up auth listener')
      listener.subscription.unsubscribe()
    }
  }, [router, searchParams])

  if (loading) return <div className="text-xl">Checking session...</div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">BLVE Admin Login</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                },
              },
            },
          }}
          providers={['google']}
          onlyThirdPartyProviders={true}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
        />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
      <Suspense fallback={<div className="text-xl">Loading login...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  )
}