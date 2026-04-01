import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Next.js 16: no cookie writes in route handlers either
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      external_tx_id,
      member_id,
      org_id,
      mcc_code,
      amount,
      offer_percentage,
      routing_amount,
      blve_fee,
      timestamp
    `)
    .order("timestamp", { ascending: false })

  if (error) {
    console.error(error)
    return new NextResponse("Failed to export", { status: 500 })
  }

  const header = [
    "id",
    "external_tx_id",
    "member_id",
    "org_id",
    "mcc_code",
    "amount",
    "offer_percentage",
    "routing_amount",
    "blve_fee",
    "timestamp",
  ]

  const rows = (data ?? []).map((tx) =>
    [
      tx.id,
      tx.external_tx_id,
      tx.member_id,
      tx.org_id,
      tx.mcc_code,
      tx.amount,
      tx.offer_percentage,
      tx.routing_amount,
      tx.blve_fee,
      tx.timestamp,
    ]
      .map((v) => (v === null || v === undefined ? "" : String(v)))
      .join(",")
  )

  const csv = [header.join(","), ...rows].join("\n")

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="transactions.csv"`,
    },
  })
}
