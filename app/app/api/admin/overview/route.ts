import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: orgsData, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, slug, org_type, routing_pool, parent_org_id');

    if (orgsError) throw orgsError;

    const enriched = await Promise.all(orgsData.map(async (org) => {
      const { count: subCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('parent_org_id', org.id);

      const { count: memberCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id);

      const { data: routingData } = await supabase
        .from('routing')
        .select('amount, routed_amount')
        .eq('org_id', org.id);

      const txCount = routingData?.length || 0;
      const txSum = routingData?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
      const routedSum = routingData?.reduce((sum, r) => sum + Number(r.routed_amount || 0), 0) || 0;
      const txAvg = txCount > 0 ? txSum / txCount : 0;

      return {
        ...org,
        sub_org_count: subCount || 0,
        member_count: memberCount || 0,
        tx_count: txCount,
        tx_sum: txSum,
        routed_sum: routedSum,
        tx_avg: txAvg
      };
    }));

    const totalPool = enriched.reduce((sum, o) => sum + parseFloat(o.routing_pool || '0'), 0);
    const totalTx = enriched.reduce((sum, o) => sum + o.tx_count, 0);
    const totalMembers = enriched.reduce((sum, o) => sum + o.member_count, 0);
    const totalRouted = enriched.reduce((sum, o) => sum + o.routed_sum, 0);
    const totalAmount = enriched.reduce((sum, o) => sum + o.tx_sum, 0);

    return NextResponse.json({
      success: true,
      orgs: enriched,
      summary: {
        total_pool: totalPool,
        total_orgs: orgsData.length,
        total_members: totalMembers,
        total_tx: totalTx,
        total_routed: totalRouted,
        avg_routing_percentage: totalAmount > 0 ? (totalRouted / totalAmount) * 100 : 0,
        avg_tx: totalTx > 0 ? totalAmount / totalTx : 0
      }
    });
  } catch (err: any) {
    console.error('Admin overview error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
