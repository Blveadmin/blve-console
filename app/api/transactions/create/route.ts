import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { calculateSplit } from "@/lib/config/split"

export async function POST(request: NextRequest) {
  const body = await request.json()

  const {
    amount,
    org_id,
    sub_org_id,
    member_id,
    merchant_id,
    mcc_code,
    external_tx_id,
  } = body

  if (!amount || !org_id || !external_tx_id) {
    return NextResponse.json(
      { success: false, error: "amount, org_id, and external_tx_id are required" },
      { status: 400 }
    )
  }

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

  const numericAmount = Number(amount)

  const { org, blve } = calculateSplit(numericAmount)

  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .insert({
      external_tx_id,
      amount: numericAmount,
      routing_amount: org,
      blve_fee: blve,
      org_id,
      sub_org_id: sub_org_id ?? null,
      member_id: member_id ?? null,
      merchant_id: merchant_id ?? null,
      mcc_code: mcc_code ?? null,
      offer_percentage: 0.85,
    })
    .select()
    .single()

  if (txError) {
    console.error("Transaction insert error:", txError)
    return NextResponse.json(
      { success: false, error: txError.message },
      { status: 500 }
    )
  }

  const { error: poolError } = await supabase.rpc("increment_routing_pool", {
    org_id_input: org_id,
    amount_input: org,
  })

  if (poolError) {
    console.error("Routing pool update error:", poolError)
  }

  return NextResponse.json(
    {
      success: true,
      transaction: tx,
      split: { org, blve },
    },
    { status: 201 }
  )
}
