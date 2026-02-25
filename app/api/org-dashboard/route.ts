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

    const {  org, error } = await supabase
      .from('organizations')
      .select('*')
      .ilike('slug', slug)
      .single()

    if (error || !org) {
      return NextResponse.json(
        { success: false, error: `Organization "${slug}" not found` },
        { status: 404 }
      )
    }

    let subOrgs = []
    if (org.org_type === 'parent' && org.id) {
      const {  subQuery } = await supabase
        .from('organizations')
        .select('*')
        .eq('parent_org_id', org.id)
        .order('name', { ascending: true })

      subOrgs = subQuery || []
    }

    return NextResponse.json({
      success: true,
       {
        ...org,
        sub_orgs: subOrgs
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
