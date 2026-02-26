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

    console.log('API called with slug:', slug);

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .ilike('slug', slug)
      .single()

    console.log('Found org:', org);
    console.log('Org query error:', orgError);

    if (orgError || !org) {
      return NextResponse.json(
        { success: false, error: `Organization "${slug}" not found` },
        { status: 404 }
      )
    }

    let subOrgs = []
    if (org.org_type === 'parent' && org.id) {
      const { data: subOrgsData, error: subError } = await supabase
        .from('organizations')
        .select('*')
        .eq('parent_org_id', org.id)
        .order('name', { ascending: true })

      console.log('Sub-orgs:', subOrgsData);
      console.log('Sub-orgs error:', subError);

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
