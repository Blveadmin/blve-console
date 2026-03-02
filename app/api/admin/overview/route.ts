import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)

  // Create response object early so we can mutate cookies
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Mutate the response cookies in place
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
          // Do NOT return anything here — just mutate
        },
      },
    }
  )

  try {
    const { data: orgsData, error } = await supabase
      .from('organizations')
      .select('id, name, slug, org_type, routing_pool, parent_org_id')

    if (error) throw error

    const enriched = await Promise.all(orgsData.map(async (org) => {
      const { count: subCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact' })
        .eq('parent_org_id', org.id)

      const { count: memberCount } = await supabase
        .from('members')
        .select('*', { count: 'exact' })
        .eq('org_id', org.id)

      const { data: txData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('org_id', org.id)

      const txCount = txData?.length || 0
      const txSum = txData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
      const txAvg = txCount > 0 ? txSum / txCount : 0

      return {
        ...org,
        sub_org_count: subCount || 0,
        member_count: memberCount || 0,
        tx_count: txCount,
        tx_avg: txAvg
      }
    }))

    const totalPool = enriched.reduce((sum, o) => sum + parseFloat(o.routing_pool || '0'), 0)
    const totalTx = enriched.reduce((sum, o) => sum + o.tx_count, 0)
    const totalMembers = enriched.reduce((sum, o) => sum + o.member_count, 0)

    return NextResponse.json({
      success: true,
      orgs: enriched,
      summary: {
        total_pool: totalPool,
        total_orgs: orgsData.length,
        total_members: totalMembers,
        total_tx: totalTx,
        avg_tx: totalTx > 0 ? totalPool / totalTx : 0
      }
    })
  } catch (err: any) {
    console.error('Admin overview error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
