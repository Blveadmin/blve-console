import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [membersRes, orgsRes, txRes, routingRes] = await Promise.all([
      supabase.from('members').select('id, org_id'),
      supabase.from('organizations').select('id, name'),
      supabase.from('transactions').select('org_id, routing_amount'),
      supabase.from('routing').select('org_id, routed_amount')
    ]);

    if (membersRes.error) throw membersRes.error;
    if (orgsRes.error) throw orgsRes.error;

    const members = membersRes.data || [];
    const orgs = orgsRes.data || [];
    const transactions = txRes.data || [];
    const routing = routingRes.data || [];

    const membersByOrg = orgs.map(org => ({
      org_id: org.id,
      org_name: org.name,
      members: members.filter(m => m.org_id === org.id).length
    }));

    const routingByOrg = orgs.map(org => ({
      org_id: org.id,
      org_name: org.name,
      routing_total: routing
        .filter(r => r.org_id === org.id)
        .reduce((sum, r) => sum + Number(r.routed_amount || 0), 0)
    }));

    return NextResponse.json({
      success: true,
      totalMembers: members.length,
      totalOrgs: orgs.length,
      totalTransactions: transactions.length + routing.length,
      membersByOrg,
      routingByOrg
    });
  } catch (err: any) {
    console.error('Identity error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
