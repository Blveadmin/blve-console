import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    const supabase = await createClient();

    let query = supabase.from("organizations").select("*");
    
    if (id) {
      query = query.eq("id", id);
    } else if (slug) {
      query = query.eq("slug", slug.toLowerCase());
    } else {
      return NextResponse.json({ success: false, error: "Missing id or slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await query.single();

    if (orgError || !org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    const { data: subOrgs } = await supabase
      .from("organizations")
      .select("id, name, slug, routing_pool")
      .eq("parent_org_id", org.id);

    const { count: memberCount } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id);

    const { data: routingData } = await supabase
      .from("routing")
      .select("amount, routed_amount")
      .eq("org_id", org.id);

    const transactionCount = routingData?.length || 0;
    const totalAmount = routingData?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
    const totalRouted = routingData?.reduce((sum, r) => sum + Number(r.routed_amount || 0), 0) || 0;
    const avgRoutingPercentage = totalAmount > 0 
      ? (totalRouted / totalAmount) * 100 
      : 0;

    const dashboardData = {
      ...org,
      sub_orgs: subOrgs || [],
      stats: {
        total_members: memberCount || 0,
        total_transactions: transactionCount,
        total_amount: totalAmount,
        total_routed: totalRouted,
        avg_routing_percentage: avgRoutingPercentage,
        active_org_count: (subOrgs?.length || 0) + 1
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (err: any) {
    console.error("Org dashboard error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
