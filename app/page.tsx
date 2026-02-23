'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'
import SubOrgSelector from './components/SubOrgSelector'

interface OrgData {
  id: string
  name: string
  slug: string
  org_type: string
  parent_org_id: string | null
  parent_org_name: string | null
  parent_org_slug: string | null
  category: string
  subcategory: string | null
  routing_pool: number
  monthly_routing: number
  monthly_tx: number
  active_members: number
  fromCache?: boolean
}

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null)
  const [orgData, setOrgData] = useState<OrgData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentOrgSlug, setCurrentOrgSlug] = useState('fiu')
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      setSession(result.data.session)
      setLoading(false)
    })

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      if (authListener && authListener.data && authListener.data.subscription) {
        authListener.data.subscription.unsubscribe()
      }
    }
  }, [])

  // Fetch org data with caching
  useEffect(() => {
    if (session) {
      fetchOrgData(currentOrgSlug)
    }
  }, [session, currentOrgSlug])

  async function fetchOrgData(slug: string) {
    try {
      setError(null)
      
      // Try cache first via API route
      const response = await fetch(`/api/org-dashboard?slug=${slug}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      console.log(`Org ${result.fromCache ? '(cached)' : '(fresh)'}:`, result.data)
      setOrgData(result.data)
    } catch (err: any) {
      console.error('Error fetching org data:', err)
      setError(err.message || 'Failed to load organization data')
    }
  }

  const handleSignIn = () => {
    supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: `${location.origin}/auth/callback` } 
    })
  }

  const handleOrgChange = (slug: string) => {
    setCurrentOrgSlug(slug)
    window.history.pushState({}, '', `/?org=${slug}`)
  }

  if (loading) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>⏳</div>
          Loading dashboard...
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(to bottom right, #e0e7ff, #f3e8ff)',padding:'2rem'}}>
        <div style={{textAlign:'center',maxWidth:'500px'}}>
          <div style={{fontSize:'4rem',fontWeight:'bold',marginBottom:'1rem'}}>BLVΞ</div>
          <h1 style={{fontSize:'2rem',fontWeight:'bold',marginBottom:'1.5rem'}}>Routing belief without extraction</h1>
          <p style={{fontSize:'1.1rem',color:'#666',marginBottom:'2rem'}}>FIU Athletics admin console — see real-time routing impact</p>
          <button onClick={handleSignIn} style={{background:'#000',color:'#fff',padding:'1rem 2rem',borderRadius:'1rem',fontSize:'1.1rem',fontWeight:'medium',cursor:'pointer',boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>Sign in with Google</button>
          <p style={{marginTop:'1.5rem',fontSize:'0.9rem',color:'#999'}}>Only authorized FIU Athletics staff can access this console</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
        <div style={{textAlign:'center',maxWidth:'500px',background:'#fff',padding:'2rem',borderRadius:'1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>❌</div>
          <h2 style={{fontSize:'1.5rem',marginBottom:'1rem'}}>Error Loading Dashboard</h2>
          <p style={{color:'#666',marginBottom:'1.5rem'}}>{error}</p>
          <button onClick={() => fetchOrgData(currentOrgSlug)} style={{background:'#000',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'0.5rem',cursor:'pointer'}}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',padding:'2rem'}}>
      <header style={{background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,0.1)',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <div style={{fontSize:'1.75rem',fontWeight:'bold'}}>BLVΞ</div>
          <div style={{color:'#999'}}>| {orgData?.parent_org_name || orgData?.name || 'FIU Athletics'} Console</div>
          {orgData?.fromCache && (
            <div style={{fontSize:'0.8rem',color:'#10b981',background:'#ecfdf5',padding:'0.25rem 0.75rem',borderRadius:'9999px'}}>
              ⚡ Cached
            </div>
          )}
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{color:'#666',background:'none',border:'none',fontSize:'1rem',cursor:'pointer'}}>Sign out</button>
      </header>
      
      <main style={{maxWidth:'1200px',margin:'2rem auto'}}>
        {/* Sub-Org Selector */}
        <SubOrgSelector 
          currentOrgSlug={currentOrgSlug} 
          onOrgChange={handleOrgChange} 
        />

        {/* Dashboard Metrics */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',marginBottom:'2rem'}}>
          <div style={{background:'#fff',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{color:'#999',fontSize:'0.9rem',marginBottom:'0.5rem'}}>
              {orgData?.org_type === 'sub' ? '🎯 SUB-ORG ' : '🏛️ '}TOTAL ROUTING POOL
            </div>
            <div style={{fontSize:'2.5rem',fontWeight:'bold',color:'#000'}}>
              ${orgData?.routing_pool?.toFixed(2) || '0.00'}
            </div>
            <div style={{color:'#10b981',fontSize:'1rem',marginTop:'0.5rem',fontWeight:'500'}}>
              +${orgData?.monthly_routing?.toFixed(2) || '0.00'} this month
            </div>
          </div>
          
          <div style={{background:'#fff',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{color:'#999',fontSize:'0.9rem',marginBottom:'0.5rem'}}>📊 MONTHLY TRANSACTIONS</div>
            <div style={{fontSize:'2.5rem',fontWeight:'bold',color:'#000'}}>
              {orgData?.monthly_tx?.toLocaleString() || '0'}
            </div>
            <div style={{color:'#666',fontSize:'1rem',marginTop:'0.5rem'}}>
              from {orgData?.active_members?.toLocaleString() || '0'} members
            </div>
            <div style={{fontSize:'0.85rem',color:'#999',marginTop:'0.5rem'}}>
              {orgData?.category ? `Category: ${orgData.category}` : ''}
              {orgData?.subcategory ? ` · ${orgData.subcategory}` : ''}
            </div>
          </div>
          
          <div style={{background:'#fff',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{color:'#999',fontSize:'0.9rem',marginBottom:'0.5rem'}}>💰 AVG ROUTING PER TX</div>
            <div style={{fontSize:'2.5rem',fontWeight:'bold',color:'#000'}}>${
              orgData?.monthly_routing && orgData?.monthly_tx 
                ? (orgData.monthly_routing / orgData.monthly_tx).toFixed(2) 
                : '0.00'
            }</div>
            <div style={{color:'#666',fontSize:'1rem',marginTop:'0.5rem'}}>
              covenant-preserving (88% to {orgData?.name || 'FIU'})
            </div>
          </div>
        </div>

        {/* Parent Org Info */}
        {orgData?.parent_org_id && (
          <div style={{background:'#f0f9ff',borderLeft:'4px solid #3b82f6',padding:'1rem',borderRadius:'0.5rem',marginTop:'1rem'}}>
            <div style={{fontSize:'0.9rem',color:'#1e40af',fontWeight:'medium'}}>
              🏛️ Part of <strong>{orgData.parent_org_name}</strong> |{' '}
              <button 
                onClick={() => handleOrgChange(orgData.parent_org_slug || 'fiu')}
                style={{background:'none',border:'none',color:'#3b82f6',cursor:'pointer',textDecoration:'underline',padding:0,fontWeight:'bold'}}
              >
                View parent org dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}