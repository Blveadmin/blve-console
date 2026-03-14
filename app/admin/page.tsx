"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const supabase = createClient();

  const [stats, setStats] = useState({
    members: 0,
    orgs: 0,
    transactions: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [{ count: memberCount }, { count: orgCount }, { count: txCount }] =
        await Promise.all([
          supabase.from("members").select("*", { count: "exact", head: true }),
          supabase.from("orgs").select("*", { count: "exact", head: true }),
          supabase
            .from("transactions")
            .select("*", { count: "exact", head: true }),
        ]);

      setStats({
        members: memberCount ?? 0,
        orgs: orgCount ?? 0,
        transactions: txCount ?? 0,
      });
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">BLVΞ Dashboard</h1>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Members"
          value={stats.members}
          description="Total active BLVΞ members"
        />

        <DashboardCard
          title="Organizations"
          value={stats.orgs}
          description="Parent orgs + sub‑orgs"
        />

        <DashboardCard
          title="Transactions"
          value={stats.transactions}
          description="Total routed transactions"
        />
      </div>

      {/* Routing + Identity Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Identity Layer</h2>
          <p className="text-gray-600 mb-4">
            Members → Sub‑Orgs → Parent Orgs → BLVΞ Routing Layer
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Every member belongs to a sub‑org</li>
            <li>Sub‑orgs roll up to parent orgs</li>
            <li>Routing flows upward automatically</li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <p className="text-gray-600">
            Coming soon: live feed of member joins, transactions, and routing
            events.
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-4xl font-bold mt-2">{value}</p>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
  );
}
