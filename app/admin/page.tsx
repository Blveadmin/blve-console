"use client";
import { useEffect, useState } from "react";
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
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Activity,
} from "lucide-react";

const SPARK_POOL    = [40, 55, 48, 62, 58, 70, 65, 80, 74, 88];
const SPARK_ROUTED  = [20, 28, 24, 35, 30, 42, 38, 50, 45, 58];
const SPARK_ORGS    = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
const SPARK_MEMBERS = [10, 18, 22, 30, 28, 36, 40, 48, 52, 60];

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || "Failed to load overview");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Admin Dashboard" subtitle="Comprehensive overview of the BLVΞ network performance">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin text-[#3B82F6]" size={36} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Admin Dashboard" subtitle="Comprehensive overview of the BLVΞ network performance">
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

  const metrics = [
    {
      label: "Total Pool",
      value: `$${(summary.total_pool || 0).toLocaleString()}`,
      icon: <TrendingUp size={22} />,
      trend: { value: 12.4, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_POOL} color="#3B82F6" />,
    },
    {
      label: "Total Routed",
      value: `$${(summary.total_routed || 0).toLocaleString()}`,
      icon: <CreditCard size={22} />,
      trend: { value: 8.1, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_ROUTED} color="#4ADE80" />,
    },
    {
      label: "Organizations",
      value: summary.total_orgs || 0,
      icon: <Building2 size={22} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_ORGS} color="#A78BFA" />,
    },
    {
      label: "Members",
      value: summary.total_members || 0,
      icon: <Users size={22} />,
      trend: { value: 5.3, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_MEMBERS} color="#FBBF24" />,
    },
  ];

  const routingChartData = orgs.slice(0, 8).map((org: any) => ({
    label: (org.name || "Org").slice(0, 6),
    value: parseFloat(org.routed_sum || 0),
  }));

  const memberChartData = orgs.slice(0, 8).map((org: any) => ({
    label: (org.name || "Org").slice(0, 6),
    value: parseInt(org.member_count || 0),
  }));

  return (
    <BLVPageContainer title="Admin Dashboard" subtitle="Comprehensive overview of the BLVΞ network performance">

      {/* KPI Row */}
      <BLVTotalsRow metrics={metrics} />

      <BLVSeparationLine />

      {/* Two-Column Analytics */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Network Analytics"
          subtitle="Routing volume and member distribution across organizations"
          icon={<Activity size={20} />}
        />
        <BLVTwoColumn
          leftTitle="Routing Volume by Org"
          leftContent={
            <BLVChart
              data={routingChartData.length > 0 ? routingChartData : [{ label: "—", value: 0 }]}
              type="bar"
              color="#3B82F6"
              height={160}
            />
          }
          rightTitle="Member Distribution"
          rightContent={
            <BLVChart
              data={memberChartData.length > 0 ? memberChartData : [{ label: "—", value: 0 }]}
              type="line"
              color="#4ADE80"
              height={160}
            />
          }
        />
      </div>

      <BLVSeparationLine />

      {/* Organization Performance */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Organization Performance"
          subtitle="Health and activity metrics for each organization"
          icon={<Building2 size={20} />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.length === 0 ? (
            <BLVCard>
              <p className="text-sm text-[rgba(255,255,255,0.60)]">No organizations found.</p>
            </BLVCard>
          ) : (
            orgs.map((org: any) => (
              <BLVCard key={org.id} hoverable>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-white truncate">{org.name}</h3>
                    <p className="text-xs text-[rgba(255,255,255,0.35)] font-mono mt-0.5">{org.slug}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                    <BLVMetric label="Members" value={org.member_count || 0} size="sm" />
                    <BLVMetric label="Routed" value={`$${(org.routed_sum || 0).toLocaleString()}`} size="sm" />
                  </div>
                </div>
              </BLVCard>
            ))
          )}
        </div>
      </div>

      <BLVSeparationLine />

      {/* Transaction Activity */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Transaction Activity"
          subtitle="Real-time transaction volume and routing metrics"
          icon={<TrendingUp size={20} />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BLVCard>
            <BLVMetric
              label="Total Transactions"
              value={(summary.total_tx || 0).toLocaleString()}
              size="lg"
              trend={{ value: 3.2, direction: "up" }}
            />
          </BLVCard>
          <BLVCard>
            <BLVMetric
              label="Avg Routing %"
              value={`${(summary.avg_routing_percentage || 0).toFixed(2)}%`}
              size="lg"
              trend={{ value: 1.1, direction: "up" }}
            />
          </BLVCard>
        </div>
      </div>

    </BLVPageContainer>
  );
}
