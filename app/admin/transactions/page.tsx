export default function TransactionsPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-blue-800">Transactions Page</h1>
      <p className="text-xl mb-4">This is the dedicated transactions page.</p>
      <p className="text-gray-600 mb-8">
        If you're seeing this, the page loaded correctly. No redirect happened.
      </p>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg">Current URL: <strong>{typeof window !== 'undefined' ? window.location.href : 'Server render'}</strong></p>
      </div>
    </div>
  )
}
