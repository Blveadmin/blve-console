import { createClient } from "@/utils/supabase/server";

export interface RoutingRecord {
  id?: string;
  memberId: string;
  merchantId: string;
  orgId: string;
  subOrgId?: string;
  amount: number;
  routedAmount: number;
  timestamp: string;
  createdAt?: string;
}

/**
 * Insert a new routing record into the database
 */
export async function insertRoutingRecord(record: RoutingRecord) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("routing")
      .insert({
        member_id: record.memberId,
        merchant_id: record.merchantId,
        org_id: record.orgId,
        sub_org_id: record.subOrgId || null,
        amount: record.amount,
        routed_amount: record.routedAmount,
        timestamp: record.timestamp,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting routing record:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Exception inserting routing record:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get routing summary for a specific organization
 */
export async function getRoutingSummaryByOrg(orgId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("routing")
      .select("amount, routed_amount")
      .eq("org_id", orgId);

    if (error) {
      console.error("Error fetching org routing summary:", error);
      return { totalAmount: 0, totalRouted: 0, transactionCount: 0 };
    }

    const records = data || [];
    const totalAmount = records.reduce((sum, r: any) => sum + Number(r.amount || 0), 0);
    const totalRouted = records.reduce((sum, r: any) => sum + Number(r.routed_amount || 0), 0);
    
    return {
      totalAmount,
      totalRouted,
      transactionCount: records.length,
    };
  } catch (error) {
    console.error("Exception fetching org routing summary:", error);
    return { totalAmount: 0, totalRouted: 0, transactionCount: 0 };
  }
}
