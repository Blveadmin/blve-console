"use client"

import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/org-dashboard")
      .then((res) => res.json())
      .then((json) => setData(json))
  }, [])

  if (!data) return <div className="p-6">Loading...</div>

  const orgs = data.orgs || []
  const parents = orgs.filter((o: any) => !o.parent_org_id)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Organization</th>
              <th className="px-4 py-2">Routing Pool</th>
              <th className="px-4 py-2">Members</th>
              <th className="px-4 py-2">Transactions</th>
            </tr>
          </thead>

          <tbody>
            {parents.map((org: any) => (
              <tr key={org.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <a
                    href={`/admin/org/${org.id}`}
                    className="underline hover:text-blue-600"
                  >
                    {org.name}
                  </a>
                </td>
                <td className="px-4 py-2">${org.routing_pool}</td>
                <td className="px-4 py-2">{org.member_count}</td>
                <td className="px-4 py-2">{org.tx_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
