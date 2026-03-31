import { NextResponse } from "next/server";
import { insertRoutingRecord } from "@/lib/routing/routingDb";
import { calculateRouting } from "@/lib/routing/routingLogic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, merchantId, orgId, subOrgId, amount, timestamp } = body;

    if (!memberId || !merchantId || !orgId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate routed amount based on business logic
    const routing = calculateRouting(amount, {
      memberId,
      orgId,
      subOrgId,
      orgName: "", // Name not required for record insertion
    });
    const routedAmount = routing.routedAmount;

    const result = await insertRoutingRecord({
      memberId,
      merchantId,
      orgId,
      subOrgId,
      amount,
      routedAmount,
      timestamp: timestamp || new Date().toISOString(),
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      routedAmount,
    });
  } catch (err: any) {
    console.error("Route transaction error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
