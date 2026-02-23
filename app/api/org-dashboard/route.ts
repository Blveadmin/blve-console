import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCachedOrgDashboard, setCachedOrgDashboard } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'fiu'

    // Try cache first
    const cached = await getCachedOrgDashboard(slug)
    if (cached) {
      return NextResponse.json({ 
        success: true, 
        data: cached,
        fromCache: true
      })
    }

    // Cache miss - fetch from DB
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )

    const { data, error } = await supabase
      .from('org_dashboard_view')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Organization not found' 
      }, { status: 404 })
    }

    // Cache the result
    await setCachedOrgDashboard(slug, data)

    return NextResponse.json({ 
      success: true, 
      data,
      fromCache: false
    })
  } catch (error: any) {
    console.error('Org dashboard API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}