'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Inner client component with search params
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Login page mounted - starting session check')

    const redirectPath = searchParams.get('redirect') || '/admin/dashboard'
    console.log('Redirect target:', redirectPath)

    // Clear hash if callback
    if (window.location.hash) {
      console.log('Clearing callback hash')
      window.location.hash = ''
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('getSession result:', { hasSession: !!session, error })
      if (session) {
        console.log('Session found - redirecting')
        router.replace(redirectPath)
      } else {
        console.log('No session - showing login UI')
        setLoading(false)
      }
    }).catch(err => {
      console.error('getSession error:', err)
      setError('Session check failed')
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? 'session present' : 'no session')
      if (session) {
        console.log('Listener detected session - redirecting')
        router.replace(redirectPath)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [router, searchParams])

  if (loading) return <div className="text-xl">Checking session...</div>

  return (
    <>
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
    </>
  )
}

// Suspense wrapper for prerender safety
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <Suspense fallback={<div className="text-xl">Loading login...</div>}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  )
}