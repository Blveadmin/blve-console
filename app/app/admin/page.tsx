"use client";

import { useEffect, useState } from "react";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
} from "@/components/blve";
import { Building2, Users, CreditCard, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

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

  if (loading) return <div className="p-12 text-center"><RefreshCw className="animate-spin mx-auto" /></div>;
  if (error) return <div className="p-12 text-center text-red-500"><AlertCircle className="mx-auto" /> {error}</div>;

  const summary = data.summary;
  const metrics = [
    { label: "Total Pool", value: `$${summary.total_pool.toLocaleString()}`, icon: <TrendingUp size={24} /> },
    { label: "Total Routed", value: `$${summary.total_routed.toLocaleString()}`, icon: <CreditCard size={24} /> },
    { label: "Organizations", value: summary.total_orgs, icon: <Building2 size={24} /> },
    { label: "Members", value: summary.total_members, icon: <Users size={24} /> },
  ];

  return (
    <BLVPageContainer title="Admin Overview" subtitle="System-wide performance and attribution metrics">
      <BLVTotalsRow metrics={metrics} />
      <BLVSeparationLine />
      <div className="space-y-6">
        <BLVSectionHeader title="Organization Performance" icon={<Building2 size={20} />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.orgs.map((org: any) => (
            <BLVCard key={org.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold">{org.name}</h3>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{org.slug}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <BLVMetric label="Members" value={org.member_count} size="sm" />
                <BLVMetric label="Routed" value={`$${org.routed_sum.toLocaleString()}`} size="sm" />
              </div>
            </BLVCard>
          ))}
        </div>
      </div>
    </BLVPageContainer>
  );
}
