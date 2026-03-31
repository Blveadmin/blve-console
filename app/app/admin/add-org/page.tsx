"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
} from "@/components/blve";
import { Building2, TrendingUp, RefreshCw, AlertCircle, Users, CreditCard } from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get("org")?.toLowerCase().trim() || "fiu";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ React 19–safe effect
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (isMounted) setLoading(true);

      try {
        const res = await fetch(`/api/org-dashboard?slug=${encodeURIComponent(orgSlug)}`);
        const result = await res.json();

        if (!isMounted) return;

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to load dashboard");
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [orgSlug]);

  if (loading)
    return (
      <div className="p-12 text-center">
        <RefreshCw className="animate-spin mx-auto" />
      </div>
    );

  if (error)
    return (
      <div className="p-12 text-center text-red-500">
        <AlertCircle className="mx-auto" /> {error}
      </div>
    );

  const stats = data.stats;

  const metrics = [
    {
      label: "Routing Pool",
      value: `$${parseFloat(data.routing_pool).toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Total Routed",
      value: `$${stats.total_routed.toLocaleString()}`,
      icon: <CreditCard size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Members",
      value: stats.total_members,
      icon: <Users size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Sub-Orgs",
      value: stats.active_org_count - 1,
      icon: <Building2 size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer title={`${data.name} Dashboard`} subtitle={`Performance metrics for ${data.slug}`}>
      <BLVTotalsRow metrics={metrics} />
      <BLVSeparationLine />

      <div className="space-y-6">
        <BLVSectionHeader title="Sub-Organizations" icon={<Building2 size={20} />} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.sub_orgs.map((sub: any) => (
            <BLVCard key={sub.id} className="p-6">
              <h3 className="font-bold mb-2">{sub.name}</h3>
              <BLVMetric label="Pool" value={`$${parseFloat(sub.routing_pool).toLocaleString()}`} size="sm" />
            </BLVCard>
          ))}
        </div>
      </div>
    </BLVPageContainer>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
