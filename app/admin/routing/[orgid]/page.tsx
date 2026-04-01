"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  GitBranch,
  TrendingUp,
  ArrowRight,
  History,
  Users,
  Building2,
  ChevronRight,
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

export default function OrgRoutingDetailPage() {
  const params = useParams() as { orgid: string };
  const orgId = params.orgid;

  const [data, setData] = useState<OrgDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org-dashboard");
        const json = (await res.json()) as OrgDashboardResponse;

        if (!res.ok) {
          setError(json.error || "Failed to load routing data");
          return;
        }

        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load routing data");
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
      <BLVPageContainer title="Organization Routing">
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
      <BLVPageContainer title="Organization Routing">
        <BLVCard>
          <p className="text-gray-600">Loading routing data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const orgs = data.orgs || [];
  const members = data.members || [];
  const transactions = data.transactions || [];

  const org = orgs.find((o: any) => o.id === orgId);
  if (!org) {
    return (
      <BLVPageContainer title="Organization Routing">
        <BLVCard>
          <p className="text-red-700 font-medium">Organization not found.</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const orgMembers = members.filter((m: any) => m.org_id === org.id);
  const orgMemberIds = orgMembers.map((m: any) => m.id);
  const orgTx = transactions.filter((t: any) => orgMemberIds.includes(t.member_id));

  const totalRouting = orgTx.reduce((sum, t) => sum + (t.routing_amount || 0), 0);
  const totalAmount = orgTx.reduce((sum, t) => sum + (t.amount || 0), 0);
  const avgRouting = orgTx.length > 0 ? totalRouting / orgTx.length : 0;

  // ─────────────────────────────────────────────────────────────────
  // TOTALS ROW METRICS
  // ─────────────────────────────────────────────────────────────────
  const totalsMetrics = [
    {
      label: "Total Routing",
      value: `$${totalRouting.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Transaction Volume",
      value: `$${totalAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <ArrowRight size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Avg Routing / Tx",
      value: `$${avgRouting.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <GitBranch size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  // Process members with their routing stats
  const routingByMember = orgMembers.map((m) => {
    const tx = orgTx.filter((t) => t.member_id === m.id);
    const routing = tx.reduce((sum, t) => sum + (t.routing_amount || 0), 0);
    return { ...m, routing, txCount: tx.length };
  });

  return (
    <BLVPageContainer 
      title={`Routing – ${org.name}`} 
      subtitle="Detailed routing performance and member activity"
    >
      {/* TOTALS ROW */}
      <BLVTotalsRow metrics={totalsMetrics} />

      {/* SEPARATION LINE */}
      <BLVSeparationLine />

      {/* ACTIONS */}
      <div className="flex justify-end">
        <Link
          href={`/admin/orgs/${org.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-50 transition-colors duration-150 text-sm font-bold"
        >
          <Building2 size={18} />
          View Organization Profile
        </Link>
      </div>

      {/* ROUTING BY MEMBER */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Routing by Member"
          subtitle={`${orgMembers.length} member${orgMembers.length !== 1 ? "s" : ""} active in this organization`}
          icon={<Users size={20} />}
        />
        
        {routingByMember.length === 0 ? (
          <BLVCard>
            <p className="text-gray-600">No routing activity for this organization yet.</p>
          </BLVCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {routingByMember.map((member) => (
              <Link key={member.id} href={`/admin/members/${member.id}`}>
                <BLVCard className="hover:border-gray-300 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                          {member.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-12">
                      <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-gray-900">
                          ${member.routing.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-gray-500 font-medium uppercase">Routing</p>
                      </div>
                      
                      <div className="hidden lg:block text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {member.txCount}
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
        )}
      </div>

      {/* ROUTING HISTORY */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Organization Routing History"
          subtitle="Latest routing transactions for this organization"
          icon={<History size={20} />}
        />
        
        {orgTx.length === 0 ? (
          <BLVCard>
            <p className="text-gray-600">No routing transactions yet.</p>
          </BLVCard>
        ) : (
          <BLVCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Member</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Routing</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orgTx.map((t) => {
                    const member = orgMembers.find((m: any) => m.id === t.member_id);
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
