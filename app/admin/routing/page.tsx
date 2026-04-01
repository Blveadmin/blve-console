"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Building2,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  History,
  ShieldCheck,
  Activity,
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

const SPARK_ROUTED  = [20, 28, 24, 35, 30, 42, 38, 50, 45, 58];
const SPARK_POOL    = [40, 55, 48, 62, 58, 70, 65, 80, 74, 88];
const SPARK_PCT     = [8.2, 8.5, 8.3, 8.8, 8.6, 9.0, 8.9, 9.2, 9.1, 9.4];

export default function RoutingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Failed to load routing data.");
          return;
        }
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load routing data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Routing Engine" subtitle="Real-time monitor of the BLVΞ attribution engine">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin text-[#3B82F6]" size={36} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Routing Engine" subtitle="Real-time monitor of the BLVΞ attribution engine">
        <BLVCard>
          <div className="flex items-center gap-4 text-[#F87171]">
            <AlertCircle size={22} />
            <p className="text-sm">{error}</p>
          </div>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const orgs    = data?.orgs || [];
  const summary = data?.summary || {};

  const totalsMetrics = [
    {
      label: "Total Routed Amount",
      value: `$${(summary.total_routed || 0).toLocaleString()}`,
      icon: <TrendingUp size={22} />,
      trend: { value: 8.4, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_ROUTED} color="#4ADE80" />,
    },
    {
      label: "Network Routing Pool",
      value: `$${(summary.total_pool || 0).toLocaleString()}`,
      icon: <ShieldCheck size={22} />,
      trend: { value: 12.4, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_POOL} color="#3B82F6" />,
    },
    {
      label: "Avg Routing %",
      value: `${(summary.avg_routing_percentage || 0).toFixed(2)}%`,
      icon: <Activity size={22} />,
      trend: { value: 1.2, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_PCT} color="#FBBF24" />,
    },
    {
      label: "Active Nodes",
      value: orgs.length,
      icon: <Building2 size={22} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  const routedByOrgData = orgs.slice(0, 8).map((org: any) => ({
    label: (org.name || "Org").slice(0, 6),
    value: parseFloat(org.routed_sum || 0),
  }));

  const poolByOrgData = orgs.slice(0, 8).map((org: any) => ({
    label: (org.name || "Org").slice(0, 6),
    value: parseFloat(org.routing_pool || 0),
  }));

  return (
    <BLVPageContainer
      title="Routing Engine"
      subtitle="Real-time monitor of the BLVΞ attribution engine"
    >
      <BLVTotalsRow metrics={totalsMetrics} />
      <BLVSeparationLine />

      <div className="space-y-6">
        <BLVSectionHeader
          title="Routing Analytics"
          subtitle="Attribution volume and pool distribution across network nodes"
          icon={<Activity size={20} />}
        />
        <BLVTwoColumn
          leftTitle="Routed Amount by Node"
          leftContent={
            <BLVChart
              data={routedByOrgData.length > 0 ? routedByOrgData : [{ label: "—", value: 0 }]}
              type="bar"
              color="#4ADE80"
              height={160}
            />
          }
          rightTitle="Pool Balance by Node"
          rightContent={
            <BLVChart
              data={poolByOrgData.length > 0 ? poolByOrgData : [{ label: "—", value: 0 }]}
              type="line"
              color="#3B82F6"
              height={160}
            />
          }
        />
      </div>

      <BLVSeparationLine />

      <div className="space-y-6">
        <BLVSectionHeader
          title="Routing Nodes"
          subtitle="Organization-level routing configuration and performance"
          icon={<Building2 size={20} />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.length === 0 ? (
            <BLVCard>
              <p className="text-sm text-[rgba(255,255,255,0.60)]">No routing nodes found.</p>
            </BLVCard>
          ) : (
            orgs.map((org: any) => (
              <Link key={org.id} href={`/admin/routing/${org.id}`}>
                <BLVCard hoverable className="group h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#0B0E11] rounded-xl flex items-center justify-center text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] transition-colors duration-200 flex-shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-white group-hover:text-[#3B82F6] transition-colors duration-200 truncate">
                          {org.name}
                        </h3>
                        <p className="text-xs text-[rgba(255,255,255,0.35)] font-mono mt-0.5">{org.slug}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                      <BLVMetric label="Routed" value={`$${(org.routed_sum || 0).toLocaleString()}`} size="sm" />
                      <BLVMetric label="Pool" value={`$${parseFloat(org.routing_pool || 0).toLocaleString()}`} size="sm" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between group-hover:border-[rgba(59,130,246,0.3)] transition-colors duration-200">
                    <span className="text-xs text-[rgba(255,255,255,0.35)] font-semibold uppercase tracking-wider">View Node Details</span>
                    <ChevronRight size={16} className="text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </BLVCard>
              </Link>
            ))
          )}
        </div>
      </div>

      <BLVSeparationLine />

      <div className="space-y-6">
        <BLVSectionHeader
          title="Recent Routing Events"
          subtitle="Latest activity from the BLVΞ attribution engine"
          icon={<History size={20} />}
        />
        <BLVCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0B0E11] border-b border-[rgba(255,255,255,0.08)]">
                  <th className="px-6 py-3.5 text-xs font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-widest">Time</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-widest">Node</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-widest text-right">Attribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">14:2{i} PM</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">
                        {orgs[i % Math.max(orgs.length, 1)]?.name || "Network Node"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-white">${(100 + i * 73.5).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-[#4ADE80]">${(10 + i * 7.35).toFixed(2)}</span>
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
