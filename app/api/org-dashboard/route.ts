import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')?.toLowerCase().trim().replace(/\.$/, '') || 'fiu'

    // FIXED: destructure 'data' as 'org' + 'error'
    const { data: org, error: queryError } = await supabase
      .from('organizations')
      .select('*')
      .ilike('slug', slug)
      .single()

    if (queryError || !org) {
      return NextResponse.json(
        { success: false, error: `Organization "${slug}" not found` },
        { status: 404 }
      )
    }

    let subOrgs = []
    if (org.org_type === 'parent' && org.id) {
      // FIXED: same destructuring pattern here
      const { data: subOrgsData, error: subError } = await supabase
        .from('organizations')
        .select('*')
        .eq('parent_org_id', org.id)
        .order('name', { ascending: true })

      if (subError) {
        console.error('Sub-orgs query error:', subError.message)
      }

      subOrgs = subOrgsData || []
    }

    return NextResponse.json({
      success: true,
      data: {
        ...org,
        sub_orgs: subOrgs
      }
    })
  } catch (error: any) {
    console.error('API catch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
