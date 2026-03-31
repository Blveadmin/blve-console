"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  Building2,
  Users,
  TrendingUp,
  GitBranch,
  ArrowRight,
} from "lucide-react";

type Org = {
  id: string;
  name: string;
  routing_pool: string | number;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
};

type Transaction = {
  id: string;
  amount: number;
  routing_amount: number;
  blve_fee: number;
  external_tx_id: string;
};

type OrgDetailResponse = {
  org?: Org;
  suborgs?: Org[];
  members?: Member[];
  transactions?: Transaction[];
  error?: string;
};

export default function OrgDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<OrgDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/org-dashboard?id=${id}`);
        const json = (await res.json()) as OrgDetailResponse;

        if (!res.ok) {
          setError(json.error || "Failed to load organization.");
          return;
        }

        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load organization.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // ─────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BLVPageContainer title="Organization Details">
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
      <BLVPageContainer title="Organization Details">
        <BLVCard>
          <p className="text-gray-600">Loading organization data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const { org, suborgs = [], members = [], transactions = [] } = data;

  // ─────────────────────────────────────────────────────────────────
  // NOT FOUND STATE
  // ─────────────────────────────────────────────────────────────────
  if (!org) {
    return (
      <BLVPageContainer title="Organization Details">
        <BLVCard>
          <p className="text-red-700 font-medium">Organization not found.</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // CALCULATE METRICS
  // ─────────────────────────────────────────────────────────────────
  const totalTransactionAmount = transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const totalRoutingAmount = transactions.reduce(
    (sum, t) => sum + t.routing_amount,
    0
  );
  const totalBLVEFees = transactions.reduce((sum, t) => sum + t.blve_fee, 0);

  // ─────────────────────────────────────────────────────────────────
  // TOTALS ROW METRICS
  // ─────────────────────────────────────────────────────────────────
  const totalsMetrics = [
    {
      label: "Routing Pool",
      value: `$${Number(org.routing_pool).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Members",
      value: members.length,
      icon: <Users size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Transactions",
      value: transactions.length,
      icon: <ArrowRight size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Sub-Organizations",
      value: suborgs.length,
      icon: <GitBranch size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer title={org.name} subtitle="Organization overview and analytics">
      {/* TOTALS ROW */}
      <BLVTotalsRow metrics={totalsMetrics} />

      {/* SEPARATION LINE */}
      <BLVSeparationLine />

      {/* FINANCIAL OVERVIEW */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Financial Overview"
          subtitle="Transaction and routing metrics"
          icon={<TrendingUp size={20} />}
        />
        <BLVTwoColumn
          leftTitle="Transaction Summary"
          rightTitle="Fee Breakdown"
          leftContent={
            <div className="space-y-4">
              <BLVMetric
                label="Total Transaction Amount"
                value={`$${totalTransactionAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                size="lg"
              />
              <BLVMetric
                label="Total Routing Amount"
                value={`$${totalRoutingAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                size="md"
              />
              <BLVMetric
                label="Average Transaction"
                value={
                  transactions.length > 0
                    ? `$${(totalTransactionAmount / transactions.length).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "—"
                }
                size="md"
              />
            </div>
          }
          rightContent={
            <div className="space-y-4">
              <BLVMetric
                label="Total BLVE Fees"
                value={`$${totalBLVEFees.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                size="lg"
              />
              <BLVMetric
                label="Average Fee Per Transaction"
                value={
                  transactions.length > 0
                    ? `$${(totalBLVEFees / transactions.length).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "—"
                }
                size="md"
              />
              <BLVMetric
                label="Fee Percentage"
                value={
                  totalTransactionAmount > 0
                    ? `${((totalBLVEFees / totalTransactionAmount) * 100).toFixed(2)}%`
                    : "—"
                }
                size="md"
              />
            </div>
          }
        />
      </div>

      {/* ORGANIZATION STRUCTURE */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Organization Structure"
          subtitle="Sub-organizations and hierarchy"
          icon={<Building2 size={20} />}
        />
        {suborgs.length === 0 ? (
          <BLVCard>
            <p className="text-gray-600">No sub-organizations.</p>
          </BLVCard>
        ) : (
          <BLVCard>
            <div className="space-y-3">
              {suborgs.map((suborg) => (
                <div
                  key={suborg.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <GitBranch size={18} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{suborg.name}</p>
                      <p className="text-xs text-gray-500">{suborg.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${Number(suborg.routing_pool).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-gray-500">Routing Pool</p>
                  </div>
                </div>
              ))}
            </div>
          </BLVCard>
        )}
      </div>

      {/* MEMBERS */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Members"
          subtitle={`${members.length} member${members.length !== 1 ? "s" : ""}`}
          icon={<Users size={20} />}
        />
        {members.length === 0 ? (
          <BLVCard>
            <p className="text-gray-600">No members yet.</p>
          </BLVCard>
        ) : (
          <BLVCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BLVCard>
        )}
      </div>

      {/* TRANSACTIONS */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Transactions"
          subtitle={`${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
          icon={<ArrowRight size={20} />}
        />
        {transactions.length === 0 ? (
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
                      BLVE Fee
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      External ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((transaction) => (
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
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${transaction.blve_fee.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {transaction.external_tx_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BLVCard>
        )}
      </div>
    </BLVPageContainer>
  );
}
