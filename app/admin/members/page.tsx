"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

type Org = {
  id: string
  name: string
  routing_pool: number
  tx_count: number
  member_count: number
  parent_org_id?: string | null
}

export default function OrgDetailPage() {
  const params = useParams() as { id: string }
  const orgId = params.id

  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org-dashboard")
        const json = await res.json()

        const orgs: Org[] = json.orgs || []
        const org = orgs.find((o) => o.id === orgId)

        if (!org) {
          setError("Organization not found")
          return
        }

        const subs = orgs.filter((o) => o.parent_org_id === orgId)

        // Transactions for this org (parent-level)
        const transactions = (json.transactions || []).filter(
          (t: any) => t.org_id === orgId
        )

        // Members: roll‑up for parent, direct for sub‑org
        const isParent = subs.length > 0

        const members = isParent
          ? (json.members || []).filter(
              (m: any) =>
                m.org_id === orgId ||
                subs.some((s: any) => s.id === m.org_id)
            )
          : (json.members || []).filter((m: any) => m.org_id === orgId)

        // Routing totals
        const subRoutingTotal = subs.reduce(
          (sum, s) => sum + (s.routing_pool || 0),
          0
        )
        const routingPoolTotal = (org.routing_pool || 0) + subRoutingTotal

        const subTxTotal = subs.reduce(
          (sum, s) => sum + (s.tx_count || 0),
          0
        )
        const txTotal = (org.tx_count || 0) + subTxTotal

        const avgTx = txTotal > 0 ? routingPoolTotal / txTotal : 0

        setData({
          org,
          subs,
          transactions,
          members,
          routingPoolTotal,
          txTotal,
          avgTx,
        })
      } catch (e) {
        console.error(e)
        setError("Failed to load org data")
      }
    }

    load()
  }, [orgId])

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  if (!data) return <div className="p-6">Loading...</div>

  const {
    org,
    subs,
    transactions,
    members,
    routingPoolTotal,
    txTotal,
    avgTx,
  } = data

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold">{org.name}</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold">Routing Pool</h2>
          <p className="text-3xl font-bold mt-2">
            ${routingPoolTotal.toFixed(2)}
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold">Transactions</h2>
          <p className="text-3xl font-bold mt-2">{txTotal}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold">Avg Tx</h2>
          <p className="text-3xl font-bold mt-2">{avgTx.toFixed(2)}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold">Members</h2>
          <p className="text-3xl font-bold mt-2">{members.length}</p>
        </div>
      </div>

      {/* SUB‑ORGS */}
      {subs.length > 0 && (
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-xl font-semibold mb-4">Sub‑Organizations</h2>
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Routing Pool</th>
                <th className="px-4 py-2 text-left">Members</th>
                <th className="px-4 py-2 text-left">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub: any) => (
                <tr key={sub.id} className="border-b">
                  <td className="px-4 py-2">
                    <a
                      href={`/admin/org/${sub.id}`}
                      className="underline hover:text-blue-600"
                    >
                      {sub.name}
                    </a>
                  </td>
                  <td className="px-4 py-2">${sub.routing_pool}</td>
                  <td className="px-4 py-2">{sub.member_count}</td>
                  <td className="px-4 py-2">{sub.tx_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MEMBERS */}
      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        {members.length === 0 ? (
          <p className="text-gray-500 text-sm">No members yet.</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: any) => (
                <tr key={m.id} className="border-b">
                  <td className="px-4 py-2">{m.name}</td>
                  <td className="px-4 py-2">{m.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions yet.</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Routing</th>
                <th className="px-4 py-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => (
                <tr key={t.id} className="border-b">
                  <td className="px-4 py-2">${t.amount}</td>
                  <td className="px-4 py-2">${t.routing_amount}</td>
                  <td className="px-4 py-2">
                    {new Date(t.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
