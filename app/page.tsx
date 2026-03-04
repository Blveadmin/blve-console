'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@supabase/supabase-js' // client-side only
import { Suspense } from 'react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)

  // Lazy init supabase client (only on client)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const redirectPath = searchParams.get('redirect') || '/admin/dashboard'

    // Clear hash from callback
    if (window.location.hash) {
      window.location.hash = ''
    }

    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(redirectPath)
      } else {
        setLoading(false)
      }
    })

    // Listen for sign-in
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace(redirectPath)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [router, searchParams])

  if (loading) return <div className="text-xl">Checking session...</div>

  return (
    <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">BLVE Admin Login</h1>

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
