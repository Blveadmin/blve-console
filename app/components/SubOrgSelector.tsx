'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

interface SubOrg {
  id: string
  name: string
  slug: string
  routing_pool: number
  org_type: string
  parent_org_id: string | null
  category: string
  subcategory: string | null
}

interface SubOrgSelectorProps {
  currentOrgSlug: string
  onOrgChange: (slug: string) => void
}

export default function SubOrgSelector({ currentOrgSlug, onOrgChange }: SubOrgSelectorProps) {
  const [subOrgs, setSubOrgs] = useState<SubOrg[]>([])
  const [parentOrg, setParentOrg] = useState<SubOrg | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchSubOrgs()
  }, [currentOrgSlug])

  async function fetchSubOrgs() {
    setLoading(true)
    
    try {
      // Get current org info
      const { data: currentOrg } = await supabase
        .from('org_dashboard_view')
        .select('*')
        .eq('slug', currentOrgSlug)
        .single()

      if (currentOrg) {
        if (currentOrg.org_type === 'parent') {
          // Fetch all sub-orgs under this parent
          const { data } = await supabase
            .from('org_dashboard_view')
            .select('*')
            .eq('parent_org_id', currentOrg.id)
            .order('name')

          setParentOrg(currentOrg)
          setSubOrgs(data || [])
        } else {
          // This is a sub-org, fetch its siblings and parent
          const { data: siblings } = await supabase
            .from('org_dashboard_view')
            .select('*')
            .eq('parent_org_id', currentOrg.parent_org_id)
            .order('name')

          const { data: parent } = await supabase
            .from('org_dashboard_view')
            .select('*')
            .eq('id', currentOrg.parent_org_id)
            .single()

          setParentOrg(parent || null)
          setSubOrgs(siblings || [])
        }
      }
    } catch (error) {
      console.error('Error fetching sub-orgs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || subOrgs.length === 0) return null

  return (
    <div style={{ 
      background: '#fff', 
      padding: '1rem', 
      borderRadius: '0.75rem', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '1.5rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        flexWrap: 'wrap',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #eee',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>
          🎯 SUB-ORGANIZATIONS:
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {parentOrg && (
          <button
            onClick={() => onOrgChange(parentOrg.slug)}
            style={{
              background: currentOrgSlug === parentOrg.slug ? '#000' : '#f3f4f6',
              color: currentOrgSlug === parentOrg.slug ? '#fff' : '#333',
              border: '1px solid #ddd',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: currentOrgSlug === parentOrg.slug ? 'bold' : 'normal',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🏛️</span>
            <span>{parentOrg.name}</span>
          </button>
        )}
        
        {subOrgs.map((subOrg) => (
          <button
            key={subOrg.id}
            onClick={() => onOrgChange(subOrg.slug)}
            style={{
              background: currentOrgSlug === subOrg.slug ? '#000' : '#f3f4f6',
              color: currentOrgSlug === subOrg.slug ? '#fff' : '#333',
              border: '1px solid #ddd',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: currentOrgSlug === subOrg.slug ? 'bold' : 'normal',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{getSportEmoji(subOrg.name)}</span>
            <span>{subOrg.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function getSportEmoji(name: string): string {
  const sportEmojis: { [key: string]: string } = {
    'Football': '🏈',
    'Basketball': '🏀',
    'Baseball': '⚾',
    'Swimming': '🏊',
    'Track': '🏃',
    'Soccer': '⚽',
    'Tennis': '🎾',
    'Volleyball': '🏐',
    'Golf': '⛳',
    'Hockey': '🏒',
    'Support': '🎓',
    'Research': '🔬'
  }
  
  for (const [sport, emoji] of Object.entries(sportEmojis)) {
    if (name.includes(sport)) return emoji
  }
  
  return '🏆'
}