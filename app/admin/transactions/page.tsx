import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function TransactionsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: () => cookieStore }
  )

  // 1. Check session (protect the page)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  // 2. Fetch transactions + joins
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      id,
      created_at,
      amount,
      card_last4,
      member_id,
      merchant_id,
      members!member_id (name, email),           // join to members table
      merchants!merchant_id (business_name, organization_id),  // join to merchants
      merchants!merchant_id (organizations!organization_id (name))  // join recruiting org name
    `)
    .order('created_at', { ascending: false })
    .limit(50) // start basic — increase later

  if (error) {
    console.error('Transactions fetch error:', error)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        <p className="text-red-600">Failed to load transactions: {error.message}</p>
      </div>
    )
  }

  // 3. Calculate commission & split
  const processedTransactions = transactions?.map((tx: any) => {
    const amount = tx.amount // assume dollars – divide by 100 if in cents
    const recruitingOrg = tx.merchants?.organizations // from join
    const recruitingOrgName = recruitingOrg?.name || 'BLVE (default)'

    // Commission: 4% to recruiting org, or BLVE if no org
    const commissionRate = 0.04
    const commissionAmount = amount * commissionRate

    // Simple split (expand later with fees)
    const netToMerchant = amount - commissionAmount

    return {
      ...tx,
      recruiting_org_name: recruitingOrgName,
      commission_amount: commissionAmount.toFixed(2),
      net_to_merchant: netToMerchant.toFixed(2),
      formatted_date: new Date(tx.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      formatted_amount: `$${amount.toFixed(2)}`
    }
  }) || []

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>

      {processedTransactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card Last 4</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recruiting Org (Getting Paid)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission (4%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net to Merchant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processedTransactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{tx.formatted_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{tx.formatted_amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">**** **** **** {tx.card_last4}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tx.members?.name || tx.members?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.merchants?.business_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-700">
                    {tx.recruiting_org_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                    ${tx.commission_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
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
