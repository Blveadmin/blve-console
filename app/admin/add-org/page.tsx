mkdir -p app/admin/add-org
cat > app/admin/add-org/page.tsx << 'EOF'
'use client'

import { useState } from 'react'

export default function AddOrgPage() {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    org_type: 'parent',
    routing_pool: '',
    parent_org_id: ''
  })

  const [status, setStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Adding...')

    const res = await fetch('/api/admin/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const result = await res.json()

    if (result.success) {
      setStatus('✅ Organization added successfully!')
      setForm({ name: '', slug: '', org_type: 'parent', routing_pool: '', parent_org_id: '' })
    } else {
      setStatus('❌ Error: ' + result.error)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-3xl font-bold text-center mb-8">Add New Organization</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Beast Philanthropy"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug (lowercase, no spaces)</label>
          <input
            type="text"
            placeholder="beast"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '') })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Initial Routing Pool ($)</label>
          <input
            type="number"
            placeholder="5000"
            value={form.routing_pool}
            onChange={(e) => setForm({ ...form, routing_pool: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={form.org_type}
            onChange={(e) => setForm({ ...form, org_type: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="parent">Parent Organization</option>
            <option value="sub">Sub-Organization</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg transition"
        >
          Add Organization
        </button>
      </form>

      {status && (
        <div className="mt-6 text-center font-medium text-lg">
          {status}
        </div>
      )}
    </div>
  )
}
EOF
