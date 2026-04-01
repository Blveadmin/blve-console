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
  BLVTwoColumn,
  BLVMetric,
} from "@/components/blve";
import {
  User,
  Activity,
  TrendingUp,
  Building2,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  name?: string;
  created_at: string;
  org_id?: string;
}

interface Organization {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  amount: number;
  routing_amount: number;
  timestamp: string;
  member_id: string;
}

interface OrgDashboardResponse {
  members?: Member[];
  orgs?: Organization[];
  transactions?: Transaction[];
  error?: string;
}

export default function AdminMemberDetailPage() {
  const params = useParams() as { id: string };
  const memberId = params.id;

  const [member, setMember] = useState<Member | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org-dashboard");
        const json = (await res.json()) as OrgDashboardResponse;

        const members = json.members || [];
        const orgs = json.orgs || [];
        const txs = json.transactions || [];

        const m = members.find((mm: any) => mm.id === memberId);
        if (!m) {
          setError("Member not found");
          return;
        }

        const o = orgs.find((oo: any) => oo.id === m.org_id) || null;
        const memberTx = txs.filter((t: any) => t.member_id === memberId);

        setMember(m);
        setOrg(o);
        setTransactions(memberTx);
      } catch (e) {
        console.error(e);
        setError("Failed to load member");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [memberId]);

  // ─────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BLVPageContainer title="Member Details">
        <BLVCard>
          <p className="text-red-700 font-medium">{error}</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────
  if (loading || !member) {
    return (
      <BLVPageContainer title="Member Details">
        <BLVCard>
          <p className="text-gray-600">Loading member data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // CALCULATE METRICS
  // ─────────────────────────────────────────────────────────────────
  const totalTransactionAmount = transactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );
  const totalRoutingAmount = transactions.reduce(
    (sum, t) => sum + (t.routing_amount || 0),
    0
  );
  const totalTransactions = transactions.length;
  const averageTransactionAmount =
    totalTransactions > 0 ? totalTransactionAmount / totalTransactions : 0;

  // Get member name (handle both formats)
  const memberName =
    member.name || `${member.first_name || ""} ${member.last_name || ""}`.trim();
  const joinDate = new Date(member.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ─────────────────────────────────────────────────────────────────
  // TOTALS ROW METRICS
  // ─────────────────────────────────────────────────────────────────
  const totalsMetrics = [
    {
      label: "Total Transactions",
      value: totalTransactions,
      icon: <Activity size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Total Transaction Volume",
      value: `$${totalTransactionAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Routing Contributed",
      value: `$${totalRoutingAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <ArrowRight size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Member Status",
      value: "Active",
      icon: <User size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer
      title={memberName}
      subtitle={`Member profile and activity overview`}
    >
      {/* MEMBER INFORMATION CARD */}
      <BLVCard>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Email Address
                </p>
                <p className="text-gray-900 font-medium">
                  {member.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Member ID
                </p>
                <p className="text-gray-900 font-mono text-sm">{member.id}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Organization
                </p>
                {org ? (
                  <Link
                    href={`/admin/orgs/${org.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {org.name}
                  </Link>
                ) : (
                  <p className="text-gray-900">—</p>
                )}
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Member Since
                </p>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <p className="text-gray-900">{joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BLVCard>

      {/* TOTALS ROW */}
      <BLVTotalsRow metrics={totalsMetrics} />

      {/* SEPARATION LINE */}
      <BLVSeparationLine />

      {/* ACTIVITY OVERVIEW */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Activity Overview"
          subtitle="Transaction and routing metrics"
          icon={<Activity size={20} />}
        />
        <BLVTwoColumn
          leftTitle="Transaction Metrics"
          rightTitle="Routing Impact"
          leftContent={
            <div className="space-y-4">
              <BLVMetric
                label="Total Transactions"
                value={totalTransactions}
                size="lg"
              />
              <BLVMetric
                label="Average Transaction Amount"
                value={`$${averageTransactionAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                size="md"
              />
              <BLVMetric
                label="Total Transaction Volume"
                value={`$${totalTransactionAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                size="md"
              />
            </div>
          }
          rightContent={
            <div className="space-y-4">
              <BLVMetric
                label="Total Routing Contributed"
                value={`$${totalRoutingAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                size="lg"
              />
              <BLVMetric
                label="Average Routing Per Transaction"
                value={
                  totalTransactions > 0
                    ? `$${(totalRoutingAmount / totalTransactions).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "—"
                }
                size="md"
              />
              <BLVMetric
                label="Routing as % of Volume"
                value={
                  totalTransactionAmount > 0
                    ? `${((totalRoutingAmount / totalTransactionAmount) * 100).toFixed(2)}%`
                    : "—"
                }
                size="md"
              />
            </div>
          }
        />
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Transaction History"
          subtitle={`${totalTransactions} transaction${totalTransactions !== 1 ? "s" : ""}`}
          icon={<ArrowRight size={20} />}
        />
        {totalTransactions === 0 ? (
          <BLVCard>
            <p className="text-gray-600">No transactions yet.</p>
          </BLVCard>
        ) : (
          <BLVCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Routing Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Routing %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((transaction) => {
                    const routingPercent =
                      transaction.amount > 0
                        ? ((transaction.routing_amount / transaction.amount) * 100).toFixed(2)
                        : "0.00";

                    return (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ${transaction.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${transaction.routing_amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(transaction.timestamp).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {routingPercent}%
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

      {/* ACTIVITY SUMMARY */}
      {totalTransactions > 0 && (
        <div className="space-y-6">
          <BLVSectionHeader
            title="Activity Summary"
            subtitle="Key performance indicators"
            icon={<TrendingUp size={20} />}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BLVCard>
              <BLVMetric
                label="Transactions Per Day"
                value={
                  totalTransactions > 0
                    ? (
                        totalTransactions /
                        ((new Date().getTime() -
                          new Date(member.created_at).getTime()) /
                          (1000 * 60 * 60 * 24) +
                          1)
                      ).toFixed(2)
                    : "—"
                }
                size="lg"
              />
            </BLVCard>
            <BLVCard>
              <BLVMetric
                label="Average Routing Per Day"
                value={
                  totalTransactions > 0
                    ? `$${(
                        totalRoutingAmount /
                        ((new Date().getTime() -
                          new Date(member.created_at).getTime()) /
                          (1000 * 60 * 60 * 24) +
                          1)
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "—"
                }
                size="lg"
              />
            </BLVCard>
            <BLVCard>
              <BLVMetric
                label="Member Tenure (Days)"
                value={Math.floor(
                  (new Date().getTime() - new Date(member.created_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
                size="lg"
              />
            </BLVCard>
          </div>
        </div>
      )}
    </BLVPageContainer>
  );
}
