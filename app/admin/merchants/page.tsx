"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Building2,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  MapPin,
  Tag,
  Search,
  TrendingUp,
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

const SPARK_MERCHANTS = [4, 6, 5, 8, 7, 10, 9, 12, 11, 14];
const SPARK_COVERAGE  = [80, 82, 84, 85, 87, 89, 90, 91, 93, 94];
const SPARK_AVG_TX    = [35, 38, 36, 40, 39, 42, 41, 44, 43, 46];

export default function MerchantsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/merchants");
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Failed to load merchant data.");
          return;
        }
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load merchant data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Merchants" subtitle="Manage and monitor merchant network participants">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin text-[#3B82F6]" size={36} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Merchants" subtitle="Manage and monitor merchant network participants">
        <BLVCard>
          <div className="flex items-center gap-4 text-[#F87171]">
            <AlertCircle size={22} />
            <p className="text-sm">{error}</p>
          </div>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const merchants = data?.merchants || [];

  const totalsMetrics = [
    {
      label: "Total Merchants",
      value: merchants.length,
      icon: <CreditCard size={22} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_MERCHANTS} color="#3B82F6" />,
    },
    {
      label: "Active Terminals",
      value: merchants.length * 2,
      icon: <Building2 size={22} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Network Coverage",
      value: "94%",
      icon: <MapPin size={22} />,
      trend: { value: 2.4, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_COVERAGE} color="#4ADE80" />,
    },
    {
      label: "Avg Transaction",
      value: "$42.50",
      icon: <TrendingUp size={22} />,
      trend: { value: 1.8, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_AVG_TX} color="#FBBF24" />,
    },
  ];

  return (
    <BLVPageContainer
      title="Merchants"
      subtitle="Comprehensive view of all merchant network participants and their performance"
    >
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search merchants by name or location..."
            className="w-full bg-[#111418] border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[rgba(255,255,255,0.35)] focus:outline-none focus:border-[#3B82F6] transition-colors duration-200"
          />
        </div>
      </div>

      {/* KPI Row */}
      <BLVTotalsRow metrics={totalsMetrics} />

      <BLVSeparationLine />

      {/* Merchant Directory */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Merchant Directory"
          subtitle="Real-time list of all merchants participating in the BLVΞ network"
          icon={<CreditCard size={20} />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.length === 0 ? (
            <BLVCard>
              <p className="text-sm text-[rgba(255,255,255,0.60)]">No merchants found.</p>
            </BLVCard>
          ) : (
            merchants.map((merchant: any) => (
              <Link key={merchant.id} href={`/admin/merchants/${merchant.id}`}>
                <BLVCard hoverable className="group h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#0B0E11] rounded-xl flex items-center justify-center text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] transition-colors duration-200 flex-shrink-0">
                        <CreditCard size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-white group-hover:text-[#3B82F6] transition-colors duration-200 truncate">
                          {merchant.name}
                        </h3>
                        <p className="text-xs text-[rgba(255,255,255,0.35)] font-mono mt-0.5 truncate">
                          {merchant.id}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)] font-medium uppercase tracking-wider">
                        <Tag size={11} />
                        Retail
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)] font-medium uppercase tracking-wider">
                        <MapPin size={11} />
                        Miami, FL
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between group-hover:border-[rgba(59,130,246,0.3)] transition-colors duration-200">
                    <span className="text-xs text-[rgba(255,255,255,0.35)] font-semibold uppercase tracking-wider">
                      View Details
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all duration-200"
                    />
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
