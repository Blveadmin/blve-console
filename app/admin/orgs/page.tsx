"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Plus,
  ShieldCheck,
} from "lucide-react";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
  BLVSparkline,
} from "@/components/blve";

const SPARK_ORGS = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6];
const SPARK_POOL = [10, 18, 15, 25, 22, 30, 28, 38, 35, 45];
const SPARK_MEMBERS = [5, 8, 10, 14, 12, 18, 20, 24, 22, 28];

export default function OrgsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Failed to load organizations.");
          return;
        }
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load organizations.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Organizations" subtitle="Manage and monitor the BLVΞ network hierarchy">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin text-[#3B82F6]" size={36} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Organizations" subtitle="Manage and monitor the BLVΞ network hierarchy">
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
      label: "Total Organizations",
      value: orgs.length,
      icon: <Building2 size={22} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_ORGS} color="#A78BFA" />,
    },
    {
      label: "Total Members",
      value: summary.total_members || 0,
      icon: <Users size={22} />,
      trend: { value: 5.3, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_MEMBERS} color="#4ADE80" />,
    },
    {
      label: "Network Pool",
      value: `$${(summary.total_pool || 0).toLocaleString()}`,
      icon: <TrendingUp size={22} />,
      trend: { value: 12.4, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_POOL} color="#3B82F6" />,
    },
    {
      label: "Active Nodes",
      value: orgs.filter((o: any) => o.org_type === "parent").length,
      icon: <ShieldCheck size={22} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer
      title="Organizations"
      subtitle="Comprehensive view of all organizations and their hierarchies"
    >
      {/* Action bar */}
      <div className="flex justify-end">
        <Link href="/admin/add-org">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors duration-200 shadow-[0_0_16px_rgba(59,130,246,0.3)]">
            <Plus size={18} />
            Add Organization
          </button>
        </Link>
      </div>

      {/* KPI Row */}
      <BLVTotalsRow metrics={totalsMetrics} />

      <BLVSeparationLine />

      {/* Network Hierarchy */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Network Hierarchy"
          subtitle="Drill down into specific organizations to view detailed performance"
          icon={<Building2 size={20} />}
        />

        <div className="space-y-3">
          {orgs.length === 0 ? (
            <BLVCard>
              <p className="text-sm text-[rgba(255,255,255,0.60)]">No organizations found.</p>
            </BLVCard>
          ) : (
            orgs.map((org: any) => (
              <Link key={org.id} href={`/admin/orgs/${org.id}`}>
                <BLVCard hoverable className="group">
                  <div className="flex items-center justify-between">
                    {/* Left: icon + name */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#0B0E11] rounded-xl flex items-center justify-center text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] transition-colors duration-200 flex-shrink-0">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white group-hover:text-[#3B82F6] transition-colors duration-200">
                          {org.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-[#0B0E11] px-2 py-0.5 rounded text-[rgba(255,255,255,0.35)]">
                            {org.slug}
                          </span>
                          <span className="text-xs text-[rgba(255,255,255,0.35)] uppercase tracking-widest font-semibold">
                            {org.org_type || "Organization"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: metrics + chevron */}
                    <div className="flex items-center gap-8">
                      <div className="hidden md:block text-right">
                        <p className="text-base font-bold text-white">{org.member_count || 0}</p>
                        <p className="text-xs text-[rgba(255,255,255,0.35)] uppercase font-semibold tracking-wider">Members</p>
                      </div>
                      <div className="hidden lg:block text-right">
                        <p className="text-base font-bold text-white">${parseFloat(org.routing_pool || 0).toLocaleString()}</p>
                        <p className="text-xs text-[rgba(255,255,255,0.35)] uppercase font-semibold tracking-wider">Routing Pool</p>
                      </div>
                      <div className="hidden lg:block text-right">
                        <p className="text-base font-bold text-white">{org.sub_org_count || 0}</p>
                        <p className="text-xs text-[rgba(255,255,255,0.35)] uppercase font-semibold tracking-wider">Sub-Orgs</p>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all duration-200"
                      />
                    </div>
                  </div>
                </BLVCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </BLVPageContainer>
  );
}
