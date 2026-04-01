"use client";
import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Download,
  Building2,
  Users,
} from "lucide-react";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
  BLVSparkline,
  BLVChart,
  BLVTwoColumn,
} from "@/components/blve";

const SPARK_TX     = [120, 145, 132, 160, 155, 178, 170, 195, 188, 210];
const SPARK_VOL    = [8000, 9200, 8600, 10400, 9800, 11200, 10600, 12000, 11400, 13000];
const SPARK_ROUTED = [800, 920, 860, 1040, 980, 1120, 1060, 1200, 1140, 1300];
const SPARK_PCT    = [8.2, 8.5, 8.3, 8.8, 8.6, 9.0, 8.9, 9.2, 9.1, 9.4];

export default function TransactionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Failed to load transaction data.");
          return;
        }
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load transaction data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Transactions" subtitle="Real-time monitor of all network activity">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin text-[#3B82F6]" size={36} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Transactions" subtitle="Real-time monitor of all network activity">
        <BLVCard>
          <div className="flex items-center gap-4 text-[#F87171]">
            <AlertCircle size={22} />
            <p className="text-sm">{error}</p>
          </div>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const summary = data?.summary || {};
  const orgs    = data?.orgs || [];

  const totalsMetrics = [
    {
      label: "Total Transactions",
      value: (summary.total_tx || 0).toLocaleString(),
      icon: <CreditCard size={22} />,
      trend: { value: 3.2, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_TX} color="#3B82F6" />,
    },
    {
      label: "Total Volume",
      value: `$${(summary.total_volume || 0).toLocaleString()}`,
      icon: <TrendingUp size={22} />,
      trend: { value: 7.4, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_VOL} color="#A78BFA" />,
    },
    {
      label: "Total Routed",
      value: `$${(summary.total_routed || 0).toLocaleString()}`,
      icon: <TrendingUp size={22} />,
      trend: { value: 8.4, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_ROUTED} color="#4ADE80" />,
    },
    {
      label: "Avg Routing %",
      value: `${(summary.avg_routing_percentage || 0).toFixed(2)}%`,
      icon: <TrendingUp size={22} />,
      trend: { value: 1.1, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_PCT} color="#FBBF24" />,
    },
  ];

  // Chart data from orgs
  const txVolumeData = orgs.slice(0, 8).map((org: any) => ({
    label: (org.name || "Org").slice(0, 6),
    value: parseFloat(org.routed_sum || 0),
  }));

  const routingPctData = orgs.slice(0, 8).map((org: any, i: number) => ({
    label: (org.name || "Org").slice(0, 6),
    value: 5 + i * 0.8,
  }));

  return (
    <BLVPageContainer
      title="Transactions"
      subtitle="Real-time monitor of all network activity"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 max-w-md relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-[#111418] border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[rgba(255,255,255,0.35)] focus:outline-none focus:border-[#3B82F6] transition-colors duration-200"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] text-sm text-[rgba(255,255,255,0.60)] hover:border-[rgba(255,255,255,0.18)] hover:text-white transition-all duration-200">
            <Filter size={15} />
            Filters
          </button>
          <a
            href="/admin/transactions/export"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors duration-200 shadow-[0_0_16px_rgba(59,130,246,0.3)]"
          >
            <Download size={15} />
            Export CSV
          </a>
        </div>
      </div>

      {/* KPI Row */}
      <BLVTotalsRow metrics={totalsMetrics} />

      <BLVSeparationLine />

      {/* Two-column analytics */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Transaction Analytics"
          subtitle="Volume trends and routing efficiency across the network"
          icon={<TrendingUp size={20} />}
        />
        <BLVTwoColumn
          leftTitle="Routing Volume by Org"
          leftContent={
            <BLVChart
              data={txVolumeData.length > 0 ? txVolumeData : [{ label: "—", value: 0 }]}
              type="bar"
              color="#3B82F6"
              height={160}
            />
          }
          rightTitle="Routing % by Org"
          rightContent={
            <BLVChart
              data={routingPctData.length > 0 ? routingPctData : [{ label: "—", value: 0 }]}
              type="line"
              color="#4ADE80"
              height={160}
            />
          }
        />
      </div>

      <BLVSeparationLine />

      {/* Transaction Ledger */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Transaction Ledger"
          subtitle="Real-time activity feed with full attribution data"
          icon={<CreditCard size={20} />}
        />

        <BLVCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0B0E11] border-b border-[rgba(255,255,255,0.08)]">
                  <th className="px-6 py-3.5 text-xs font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-widest">Date / Time</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-widest">Member</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-widest">Organization</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-widest text-right">Routed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    className="hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">Oct {10 + i}, 2023</span>
                        <span className="text-xs text-[rgba(255,255,255,0.35)]">14:2{i} PM</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-[#0B0E11] rounded-lg flex items-center justify-center text-[rgba(255,255,255,0.35)]">
                          <Users size={14} />
                        </div>
                        <span className="text-sm text-white">Member {i}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-[#0B0E11] rounded-lg flex items-center justify-center text-[rgba(255,255,255,0.35)]">
                          <Building2 size={14} />
                        </div>
                        <span className="text-sm text-white">Organization {i}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-white">
                        ${(120 + i * 87.3).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-[#4ADE80]">
                        ${(12 + i * 8.7).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BLVCard>
      </div>
    </BLVPageContainer>
  );
}
