"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
} from "@/components/blve";
import {
  DollarSign,
  TrendingUp,
  ArrowRight,
  History,
  ChevronRight,
  Building2,
  Users,
} from "lucide-react";

type Transaction = {
  id: string;
  member_id: string;
  amount: number;
  routing_amount: number;
  timestamp: string;
};

type Member = {
  id: string;
  name: string;
  org_id: string;
};

type Org = {
  id: string;
  name: string;
};

type OrgDashboardResponse = {
  orgs?: Org[];
  members?: Member[];
  transactions?: Transaction[];
  error?: string;
};

export default function EarningsListPage() {
  const [data, setData] = useState<OrgDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org-dashboard");
        const json = (await res.json()) as OrgDashboardResponse;

        if (!res.ok) {
          setError(json.error || "Failed to load earnings data.");
          return;
        }

        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load earnings data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BLVPageContainer title="Earnings">
        <BLVCard>
          <p className="text-red-700 font-medium">{error}</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────
  if (loading || !data) {
    return (
      <BLVPageContainer title="Earnings">
        <BLVCard>
          <p className="text-gray-600">Loading earnings data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const orgs = data.orgs || [];
  const members = data.members || [];
  const transactions = data.transactions || [];

  const totalEarnings = transactions.reduce(
    (sum: number, t: any) => sum + (t.routing_amount || 0),
    0
  );

  const earningsByOrg = orgs.map((org: any) => {
    const orgMembers = members.filter((m: any) => m.org_id === org.id);
    const orgMemberIds = orgMembers.map((m: any) => m.id);
    const orgTx = transactions.filter((t: any) => orgMemberIds.includes(t.member_id));
    const orgEarnings = orgTx.reduce((sum: number, t: any) => sum + (t.routing_amount || 0), 0);

    return {
      ...org,
      earnings: orgEarnings,
      txCount: orgTx.length,
    };
  });

  // ─────────────────────────────────────────────────────────────────
  // TOTALS ROW METRICS
  // ─────────────────────────────────────────────────────────────────
  const totalsMetrics = [
    {
      label: "Total Earnings",
      value: `$${totalEarnings.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Total Transactions",
      value: transactions.length,
      icon: <ArrowRight size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Active Organizations",
      value: orgs.length,
      icon: <Building2 size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer 
      title="Earnings" 
      subtitle="Monitor and manage network-wide earnings and payouts"
    >
      {/* TOTALS ROW */}
      <BLVTotalsRow metrics={totalsMetrics} />

      {/* SEPARATION LINE */}
      <BLVSeparationLine />

      {/* EARNINGS BY ORGANIZATION */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Earnings by Organization"
          subtitle="Distribution of earnings across organizations"
          icon={<TrendingUp size={20} />}
        />
        
        <div className="grid grid-cols-1 gap-4">
          {earningsByOrg.map((org) => (
            <Link key={org.id} href={`/admin/orgs/${org.id}`}>
              <BLVCard className="hover:border-gray-300 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                        {org.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                        {org.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12">
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ${org.earnings.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-gray-500 font-medium uppercase">Earnings</p>
                    </div>
                    
                    <div className="hidden lg:block text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {org.txCount}
                      </p>
                      <p className="text-xs text-gray-500 font-medium uppercase">Transactions</p>
                    </div>
                    
                    <div className="text-gray-300 group-hover:text-gray-900 transition-colors">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </div>
              </BLVCard>
            </Link>
          ))}
        </div>
      </div>

      {/* EARNINGS HISTORY */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Earnings History"
          subtitle="Latest earnings transactions across all members"
          icon={<History size={20} />}
        />
        
        {transactions.length === 0 ? (
          <BLVCard>
            <p className="text-gray-600">No earnings transactions found.</p>
          </BLVCard>
        ) : (
          <BLVCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Member</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Earnings</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((t) => {
                    const member = members.find((m: any) => m.id === t.member_id);
                    const date = new Date(t.timestamp);
                    const formatted_timestamp = date.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            {member ? member.name : "Unknown Member"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          ${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${t.routing_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatted_timestamp}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </BLVCard>
        )}
      </div>
    </BLVPageContainer>
  );
}
