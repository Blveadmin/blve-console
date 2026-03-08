import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function TransactionsPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login AND tell it to come back here after login
    redirect(`/login?redirect=${encodeURIComponent('/admin/transactions')}`)
  }

  // User is logged in → fetch transactions (adjust columns/joins to your schema)
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      id,
      created_at,
      amount,
      card_last4,
      member_id,
      merchant_id,
      members!inner (name, email),
      merchants!inner (business_name, organization_id),
      merchants!inner (organizations!organization_id (name))
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error loading transactions:', error)
    return <div className="p-8 text-red-600">Failed to load transactions: {error.message}</div>
  }

  // Process commission (4% to recruiting org or BLVE default)
  const processed = transactions?.map((tx: any) => {
    const amount = tx.amount // dollars; divide by 100 if cents
    const recruitingOrg = tx.merchants?.organizations
    const orgName = recruitingOrg?.name || 'BLVE (default)'

    const commission = amount * 0.04
    const net = amount - commission

    return {
      ...tx,
      recruiting_org_name: orgName,
      commission: commission.toFixed(2),
      net_to_merchant: net.toFixed(2),
      formatted_date: new Date(tx.created_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      }),
      formatted_amount: `$${amount.toFixed(2)}`
    }
  }) || []

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>

      {processed.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Last 4</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiting Org</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission (4%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net to Merchant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {processed.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.formatted_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.formatted_amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">**** **** **** {tx.card_last4 || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.members?.name || tx.members?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.merchants?.business_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
                    {tx.recruiting_org_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${tx.commission}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${tx.net_to_merchant}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
