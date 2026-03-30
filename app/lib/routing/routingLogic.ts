/**
 * BLVΞ Routing Logic Engine
 *
 * Core routing logic for deterministically calculating economic impact
 * from transactions. All calculations are transparent and auditable.
 */

import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Server-side Supabase client (admin)
// ─────────────────────────────────────────────────────────────

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables for routing logic");
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface MemberOrgInfo {
  memberId: string;
  orgId: string;
  subOrgId?: string;
  orgName: string;
  subOrgName?: string;
}

export interface RoutingCalculation {
  memberId: string;
  merchantId: string;
  orgId: string;
  subOrgId?: string;
  transactionAmount: number;
  routedAmount: number;
  routingPercentage: number;
  timestamp: string;
}

/**
 * Fetch member's organization and sub-organization information
 */
export async function getMemberOrgInfo(
  memberId: string
): Promise<MemberOrgInfo | null> {
  try {
    // Fetch member record
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from("members")
      .select("id, org_id")
      .eq("id", memberId)
      .single();

    if (memberError || !memberData) {
      console.error("Member not found:", memberError);
      return null;
    }

    const orgId = memberData.org_id;

    // Fetch organization record
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name, parent_org_id")
      .eq("id", orgId)
      .single();

    if (orgError || !orgData) {
      console.error("Organization not found:", orgError);
      return null;
    }

    // Determine if this org is a sub-org
    const subOrgId = orgData.parent_org_id ? orgId : undefined;
    const actualOrgId = orgData.parent_org_id || orgId;

    // If it's a sub-org, fetch parent org name
    let parentOrgData: { id: string; name: string } | null = null;
    if (orgData.parent_org_id) {
      const { data: parentData } = await supabaseAdmin
        .from("organizations")
        .select("id, name")
        .eq("id", actualOrgId)
        .single();
      parentOrgData = parentData;
    }

    return {
      memberId,
      orgId: actualOrgId,
      subOrgId: subOrgId,
      orgName: parentOrgData?.name || orgData.name,
      subOrgName: subOrgId ? orgData.name : undefined,
    };
  } catch (error) {
    console.error("Exception fetching member org info:", error);
    return null;
  }
}

/**
 * Calculate routing impact for a transaction
 *
 * Routing Rules:
 * - Base routing: 10% of transaction amount
 * - Adjustments based on org type and member role
 * - All calculations are deterministic and auditable
 */
export function calculateRouting(
  transactionAmount: number,
  memberOrgInfo: MemberOrgInfo
): RoutingCalculation {
  // Base routing percentage: 10%
  const baseRoutingPercentage = 0.1;

  // Calculate routed amount
  const routedAmount = transactionAmount * baseRoutingPercentage;

  return {
    memberId: memberOrgInfo.memberId,
    merchantId: "", // Will be set by caller
    orgId: memberOrgInfo.orgId,
    subOrgId: memberOrgInfo.subOrgId,
    transactionAmount,
    routedAmount,
    routingPercentage: baseRoutingPercentage * 100,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Apply routing rules and return full breakdown
 */
export async function applyRoutingRules(
  memberId: string,
  merchantId: string,
  amount: number,
  timestamp: string
): Promise[RoutingCalculation | null> {
  try {
    // Get member's org info
    const memberOrgInfo = await getMemberOrgInfo(memberId);
    if (!memberOrgInfo) {
      console.error("Could not determine member org info");
      return null;
    }

    // Calculate routing
    const routing = calculateRouting(amount, memberOrgInfo);
    routing.merchantId = merchantId;
    routing.timestamp = timestamp;

    return routing;
  } catch (error) {
    console.error("Exception applying routing rules:", error);
    return null;
  }
}

/**
 * Get routing impact summary for an organization
 */
export async function getOrgRoutingImpact(orgId: string): Promise<{
  totalTransactionAmount: number;
  totalRoutedAmount: number;
  averageRoutingPercentage: number;
  transactionCount: number;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("routing")
      .select("amount, routed_amount")
      .eq("org_id", orgId);

    if (error || !data) {
      console.error("Error fetching org routing impact:", error);
      return {
        totalTransactionAmount: 0,
        totalRoutedAmount: 0,
        averageRoutingPercentage: 0,
        transactionCount: 0,
      };
    }

    const totalTransactionAmount = data.reduce(
      (sum, r: { amount: number }) => sum + r.amount,
      0
    );
    const totalRoutedAmount = data.reduce(
      (sum, r: { routed_amount: number }) => sum + r.routed_amount,
      0
    );
    const averageRoutingPercentage =
      totalTransactionAmount > 0
        ? (totalRoutedAmount / totalTransactionAmount) * 100
        : 0;

    return {
      totalTransactionAmount,
      totalRoutedAmount,
      averageRoutingPercentage,
      transactionCount: data.length,
    };
  } catch (error) {
    console.error("Exception getting org routing impact:", error);
    return {
      totalTransactionAmount: 0,
      totalRoutedAmount: 0,
      averageRoutingPercentage: 0,
      transactionCount: 0,
    };
  }
}

/**
 * Get routing impact summary for a member
 */
export async function getMemberRoutingImpact(memberId: string): Promise<{
  totalTransactionAmount: number;
  totalRoutedAmount: number;
  averageRoutingPercentage: number;
  transactionCount: number;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("routing")
      .select("amount, routed_amount")
      .eq("member_id", memberId);

    if (error || !data) {
      console.error("Error fetching member routing impact:", error);
      return {
        totalTransactionAmount: 0,
        totalRoutedAmount: 0,
        averageRoutingPercentage
