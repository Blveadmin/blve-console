import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { calculateSplit } from "@/lib/config/split";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      org_id,
      sub_org_id,
      member_id,
      merchant_id,
      mcc_code,
      external_tx_id,
    } = body;

    if (!amount || !org_id || !external_tx_id) {
      return NextResponse.json(
        { success: false, error: "amount, org_id, and external_tx_id are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const numericAmount = Number(amount);
    const { org: routingAmount, blve: blveFee } = calculateSplit(numericAmount);

    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        external_tx_id,
        amount: numericAmount,
        routing_amount: routingAmount,
        blve_fee: blveFee,
        org_id,
        sub_org_id: sub_org_id || null,
        member_id: member_id || null,
        merchant_id: merchant_id || null,
        mcc_code: mcc_code || null,
        offer_percentage: 0.85,
      })
      .select()
      .single();

    if (txError) {
      console.error("Transaction insert error:", txError);
      return NextResponse.json({ success: false, error: txError.message }, { status: 500 });
    }

    // Update routing pool
    const { error: poolError } = await supabase.rpc("increment_routing_pool", {
      org_id_input: org_id,
      amount_input: routingAmount,
    });

    if (poolError) {
      console.error("Routing pool update error:", poolError);
    }

    return NextResponse.json({
      success: true,
      transaction: tx,
      split: { org: routingAmount, blve: blveFee },
    }, { status: 201 });

  } catch (err: any) {
    console.error("Transaction create error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
