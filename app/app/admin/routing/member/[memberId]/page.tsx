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
  Users,
  TrendingUp,
  ArrowRight,
  History,
  Building2,
  Mail,
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
  email: string;
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

export default function MemberRoutingDetailPage() {
  const params = useParams() as { memberId: string };
  const memberId = params.memberId;

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
      <BLVPageContainer title="Member Routing">
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
      <BLVPageContainer title="Member Routing">
        <BLVCard>
          <p className="text-gray-600">Loading routing data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const orgs = data.orgs || [];
  const members = data.members || [];
  const transactions = data.transactions || [];

  const member = members.find((m: any) => m.id === memberId);
  if (!member) {
    return (
      <BLVPageContainer title="Member Routing">
        <BLVCard>
          <p className="text-red-700 font-medium">Member not found.</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const org = orgs.find((o: any) => o.id === member.org_id);
  const memberTx = transactions.filter((t: any) => t.member_id === member.id);

  const totalRouting = memberTx.reduce((sum, t) => sum + (t.routing_amount || 0), 0);
  const totalAmount = memberTx.reduce((sum, t) => sum + (t.amount || 0), 0);
  const avgRouting = memberTx.length > 0 ? totalRouting / memberTx.length : 0;

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
      icon: <History size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer 
      title={`Routing – ${member.name}`} 
      subtitle="Detailed routing performance and transaction activity"
    >
      {/* TOTALS ROW */}
      <BLVTotalsRow metrics={totalsMetrics} />

      {/* SEPARATION LINE */}
      <BLVSeparationLine />

      {/* MEMBER INFO & ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BLVCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Member Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-400" />
              <span className="text-gray-900 font-medium">{member.email}</span>
            </div>
            {org && (
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-gray-400" />
                <Link href={`/admin/orgs/${org.id}`} className="text-gray-900 font-medium hover:underline">
                  {org.name}
                </Link>
              </div>
            )}
          </div>
        </BLVCard>
        
        <div className="flex flex-col justify-center gap-4">
          <Link
            href={`/admin/members/${member.id}`}
            className="flex items-center justify-between px-6 py-4 bg-white text-black border-2 border-black rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold"
          >
            <div className="flex items-center gap-3">
              <Users size={20} />
              View Member Profile
            </div>
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>

      {/* ROUTING HISTORY */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Member Routing History"
          subtitle={`${memberTx.length} routing transaction${memberTx.length !== 1 ? "s" : ""} recorded`}
          icon={<History size={20} />}
        />
        
        {memberTx.length === 0 ? (
          <BLVCard>
            <p className="text-gray-600">No routing transactions for this member yet.</p>
          </BLVCard>
        ) : (
          <BLVCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Routing</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {memberTx.map((t) => {
                    const date = new Date(t.timestamp);
                    const formatted_timestamp = date.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-150">
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
