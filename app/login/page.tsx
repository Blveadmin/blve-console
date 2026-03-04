
'use client'
// Force rebuild 2026-03-04 - Bart

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js' // FIX: added types

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Single Supabase client instance (avoids multiple GoTrueClient warning)
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

    // Clear any leftover hash from callback
    if (window.location.hash) {
      console.log('Clearing callback hash fragment')
      window.location.hash = ''
    }

    // Retry session check with delay (helps with cookie sync timing)
    const checkSession = async () => {
      for (let attempt = 1; attempt <= 4; attempt++) {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log(`Session check attempt ${attempt}:`, { hasSession: !!session, error })

        if (session) {
          console.log('Session found on attempt ' + attempt + ' - redirecting to:', redirectPath)
          setTimeout(() => {
            router.replace(redirectPath)
            // Force full refresh as fallback
            window.location.href = redirectPath
          }, 300 * attempt) // increase delay per attempt
          return
        }

        // Wait 300ms before next attempt
        await new Promise(r => setTimeout(r, 300))
      }

      console.log('No session after all retries - showing login UI')
      setLoading(false)
    }

    checkSession()

    // Auth state listener with proper types
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session ? 'session present' : 'no session')
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
