import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Fetch all orgs
    const { data: orgsData, error } = await supabase
      .from('organizations')
      .select('id, name, slug, org_type, routing_pool, parent_org_id')

    if (error) throw error

    // Fetch all members (for org detail pages)
    const { data: membersData } = await supabase
      .from('members')
      .select('*')

    // Fetch all transactions (for org detail pages)
    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false })

    // Enrich each org with sub-org count, member count, tx count, tx avg
    const enriched = await Promise.all(
      orgsData.map(async (org) => {
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
          tx_avg: txAvg,
        }
      })
    )

    // Summary totals
    const totalPool = enriched.reduce(
      (sum, o) => sum + parseFloat(o.routing_pool || '0'),
      0
    )
    const totalTx = enriched.reduce((sum, o) => sum + o.tx_count, 0)
    const totalMembers = enriched.reduce((sum, o) => sum + o.member_count, 0)

    return NextResponse.json({
      success: true,
      orgs: enriched,
      members: membersData || [],
      transactions: transactionsData || [],
      summary: {
        total_pool: totalPool,
        total_orgs: orgsData.length,
        total_members: totalMembers,
        total_tx: totalTx,
        avg_tx: totalTx > 0 ? totalPool / totalTx : 0,
      },
    })
  } catch (err: any) {
    console.error('Org dashboard error:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
