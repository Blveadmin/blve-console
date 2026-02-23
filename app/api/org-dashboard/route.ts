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
         cached,
        fromCache: true
      })
    }

    // Get cookie store (synchronous in route handlers)
    const cookieStore = cookies()
    
    // Create supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Fix: Handle cookie store typing correctly
            const cookie = cookieStore.get(name)
            return cookie ? cookie.value : null
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options)
            } catch (error) {
              console.warn('Cookie set failed:', name)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 })
            } catch (error) {
              console.warn('Cookie remove failed:', name)
            }
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