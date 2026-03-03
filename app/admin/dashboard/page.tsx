'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ChevronDown, ChevronRight } from 'lucide-react' // install lucide-react if not already

interface OrgSummary {
  id: string
  name: string
  slug: string
  org_type: string
  routing_pool: string
  sub_org_count: number
  member_count: number
  tx_count: number
  tx_avg: number
  sub_orgs?: OrgSummary[] // we'll add this
}

interface GlobalSummary {
  total_pool: number
  total_orgs: number
  total_members: number
  total_tx: number
  avg_tx: number
}

export default function AdminDashboard() {
  const [orgs, setOrgs] = useState<OrgSummary[]>([])
  const [summary, setSummary] = useState<GlobalSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set()) // track which parents are expanded

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/overview')
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        if (!json.success) throw new Error(json.error)

        // Group sub-orgs under parents
        const parentMap = new Map<string, OrgSummary>()
        const parents: OrgSummary[] = []
        json.orgs.forEach((org: OrgSummary) => {
          if (org.org_type === 'parent') {
            parentMap.set(org.id, { ...org, sub_orgs: [] })
            parents.push(parentMap.get(org.id)!)
          }
        })

        json.orgs.forEach((org: OrgSummary) => {
          if (org.org_type === 'sub') {
            const parent = parentMap.get(org.parent_org_id)
            if (parent) {
              parent.sub_orgs!.push(org)
            }
          }
        })

        setOrgs(parents)
        setSummary(json.summary)
      } catch (err: any) {
        setError(err.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedParents)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedParents(newExpanded)
  }

  if (loading) return <div className="p-10 text-center text-xl">Loading admin overview...</div>
  if (error) return <div className="p-10 text-red-600 text-center text-xl">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Admin Overview Dashboard</h1>

        {/* Global Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-600 text-sm">Total Committed</p>
              <p className="text-4xl font-bold text-green-700">${summary.total_pool.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-600 text-sm">Total Organizations</p>
              <p className="text-4xl font-bold">{summary.total_orgs}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-600 text-sm">Total Members</p>
              <p className="text-4xl font-bold">{summary.total_members}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-4xl font-bold">{summary.total_tx}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-600 text-sm">Avg Transaction</p>
              <p className="text-4xl font-bold">${summary.avg_tx.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Expandable Parents */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-8 py-5 border-b">
            <h2 className="text-2xl font-semibold">Organizations</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {orgs.map((parent) => (
              <div key={parent.id}>
                {/* Parent Row */}
                <div
                  className="flex items-center px-8 py-5 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleExpand(parent.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      {expandedParents.has(parent.id) ? (
                        <ChevronDown className="h-5 w-5 mr-2 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 mr-2 text-gray-500" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{parent.name}</div>
                        <div className="text-sm text-gray-500">/{parent.slug}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-semibold text-green-700">
                    ${parseFloat(parent.routing_pool).toLocaleString()}
                  </div>
                </div>

                {/* Expanded Sub-orgs */}
                {expandedParents.has(parent.id) && parent.sub_orgs && (
                  <div className="bg-gray-50 pl-16 pr-8 py-4">
                    <div className="space-y-3">
                      {parent.sub_orgs.map((sub) => (
                        <div key={sub.id} className="flex justify-between text-sm">
                          <div className="text-gray-700">{sub.name} /{sub.slug}</div>
                          <div className="text-green-700 font-medium">
                            ${parseFloat(sub.routing_pool).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
