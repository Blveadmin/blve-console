useEffect(() => {
  console.log('Login page mounted - starting session check')

  const redirectPath = searchParams.get('redirect') || '/admin/dashboard'
  console.log('Redirect target from query:', redirectPath)

  // Clear hash if present
  if (window.location.hash) {
    console.log('Clearing callback hash fragment')
    window.location.hash = ''
  }

  console.log('Calling supabase.auth.getSession()...')
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    console.log('getSession resolved:', { session: !!session, error })
    if (session) {
      console.log('Session found - redirecting to:', redirectPath)
      router.replace(redirectPath)
    } else {
      console.log('No session - loading = false, showing login button')
      setLoading(false)
    }
  }).catch(err => {
    console.error('getSession error:', err)
    setError('Session check failed - try again')
    setLoading(false)
  })

  console.log('Setting up auth state listener...')
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session ? 'session present' : 'no session')
    if (session) {
      console.log('Listener detected session - redirecting')
      router.replace(redirectPath)
    }
  })

  return () => {
    console.log('Cleaning up listener')
    listener.subscription.unsubscribe()
  }
}, [router, searchParams])