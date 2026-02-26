'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Suspense } from 'react'

function DashboardContent() {
  const searchParams = useSearchParams()
  const orgSlug = searchParams.get('org')?.toLowerCase().trim().replace(/\.$/, '') || 'fiu'

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔄 Loading dashboard for org:', orgSlug)
    setLoading(true)
    setError(null)

    fetch(`/api/org-dashboard?slug=${encodeURIComponent(orgSlug)}`)
      .then(async (res) => {
        console.log('📡 API response status:', res.status)
        if (!res.ok) {
          const text = await res.text()
          console.error('❌ API error response:', text.substring(0, 200))
          throw new Error(`API error ${res.status}`)
        }
        return res.json()
      })
      .then((result) => {
        console.log('✅ API success - result:', result)
        if (result.success && result.data) {
          setData(result.data)
          console.log('💾 Dashboard data loaded:', result.data.name)
        } else {
          throw new Error(result.error || 'No data in response')
        }
      })
      .catch((err) => {
        console.error('💥 Dashboard load failed:', err)
        setError(err.message || 'Unknown error')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [orgSlug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-xl text-gray-700">Loading {orgSlug.toUpperCase()} dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-800 mb-2">Error Loading Dashboard</h1>
        <p className="text-red-700 mb-4 max-w-md break-words">{error}</p>
        <p className="text-sm text-gray-600 mb-4">
          Org: <code className="bg-gray-200 px-2 py-1 rounded">{orgSlug}</code>
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">No Data Received</h1>
          <p className="text-yellow-700">API returned success but no data payload</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-3xl font-bold">{data.name} Dashboard</h1>
          <p className="text-blue-100 mt-1">Slug: {data.slug}</p>
        </div>
        
        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-6 text-center mb-8">
            <p className="text-sm text-gray-600 mb-2">Total Routing Pool</p>
            <p className="text-4xl font-bold text-blue-600">
              ${parseFloat(data.routing_pool).toLocaleString()}
            </p>
          </div>

          {data.sub_orgs && data.sub_orgs.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Sub-organizations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.sub_orgs.map((sub: any) => (
                  <div 
                    key={sub.id || sub.slug} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-lg text-gray-800">{sub.name}</h3>
                    <p className="text-gray-600 text-sm">Slug: {sub.slug}</p>
                    <p className="text-xl font-bold text-green-600 mt-2">
                      ${parseFloat(sub.routing_pool || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!data.sub_orgs || data.sub_orgs.length === 0) && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No sub-organizations configured for {data.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>⏳ Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
