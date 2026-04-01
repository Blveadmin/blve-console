"use client";

import React from "react";
import Link from "next/link";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold">BLVΞ Org</h2>
          <p className="text-blue-300 text-sm">Organization Console</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/org" className="block hover:text-blue-300">
            Dashboard
          </Link>

          <Link href="/org/members" className="block hover:text-blue-300">
            Members
          </Link>

          <Link href="/org/events" className="block hover:text-blue-300">
            Events
          </Link>

          <Link href="/org/earnings" className="block hover:text-blue-300">
            Earnings
          </Link>

          <Link href="/org/routing" className="block hover:text-blue-300">
            Routing
          </Link>

          <Link href="/org/settings" className="block hover:text-blue-300">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
