'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to BLVE Console
        </h1>
        
        <p className="text-xl text-gray-700 mb-10">
          Manage your organizations, routing pools, members, and transactions in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            href="/login"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Admin Login
          </Link>
          
          <Link 
            href="/?org=mas"
            className="px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-colors shadow-lg"
          >
            View Public Dashboard (MAS)
          </Link>
        </div>

        <p className="mt-12 text-gray-500 text-sm">
          Powered by Supabase & Next.js • © 2026 BLVE
        </p>
      </div>
    </div>
  )
}