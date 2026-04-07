"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVTwoColumn,
  BLVSparkline,
  BLVMetric,
} from "@/components/blve";

import {
  Building2,
  Store,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Mail,
  Calendar,
} from "lucide-react";

type Merchant = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  org_id: string;
};

type Org = {
  id: string;
  name: string;
};

type MerchantsResponse = {
  merchants?: Merchant[];
  orgs?: Org[];
  error?: string;
};

const SPARK_MERCHANTS = [3, 4, 5, 6, 7, 8, 10, 11, 13, 15];
const SPARK_ORGS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];

export default function MerchantsPage() {
  const [data, setData] = useState<MerchantsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/merchants-dashboard");
        const json = (await res.json()) as MerchantsResponse;

        if (!res.ok) {
          setError(json.error || "Failed to load merchants.");
          return;
        }

        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load merchants.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Merchants" subtitle="All merchants in the BLVΞ network">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin text-[#3B82F6]" size={36} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Merchants" subtitle="All merchants in the BLVΞ network">
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
  const orgs = data?.orgs || [];

  const totalsMetrics = [
    {
      label: "Total Merchants",
      value: merchants.length,
      icon: <Store size={22} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_MERCHANTS} color="#4ADE80" />,
    },
    {
      label: "Active Organizations",
      value: orgs.length,
      icon: <Building2 size={22} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_ORGS} color="#A78BFA" />,
    },
  ];

  return (
    <BLVPageContainer
      title="Merchants"
      subtitle="All merchants in the BLVΞ network"
    >
      <BLVTotalsRow metrics={totalsMetrics} />

      <BLVSeparationLine />

      <BLVSectionHeader
        title="Merchant Directory"
        subtitle={`${merchants.length} merchant${merchants.length !== 1 ? "s" : ""} registered`}
        icon={<Store size={20} />}
      />

      {merchants.length === 0 ? (
        <BLVCard>
          <p className="text-sm text-[rgba(255,255,255,0.60)]">No merchants found.</p>
        </BLVCard>
      ) : (
        <BLVTwoColumn
          leftTitle="Merchants"
          rightTitle="Organizations"
          leftContent={
            <div className="space-y-4">
              {merchants.map((merchant) => {
                const org = orgs.find((o) => o.id === merchant.org_id);
                const joinedDate = new Date(merchant.created_at).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                );

                return (
                  <Link key={merchant.id} href={`/admin/merchants/${merchant.id}`}>
                    <BLVCard hoverable className="group h-full flex flex-col justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0B0E11] rounded-xl flex items-center justify-center text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] transition-colors duration-200">
                          <Store size={20} />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white group-hover:text-[#3B82F6] transition-colors duration-200">
                            {merchant.name}
                          </h3>

                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)] font-medium">
                              <Mail size={11} />
                              {merchant.email}
                            </div>

                            <span className="text-[rgba(255,255,255,0.20)]">·</span>

                            <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)] font-medium">
                              <Calendar size={11} />
                              Joined {joinedDate}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {org ? org.name : "No Organization"}
                          </p>
                          <p className="text-xs text-[rgba(255,255,255,0.35)] uppercase tracking-wider">
                            Organization
                          </p>
                        </div>

                        <ChevronRight
                          size={20}
                          className="text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all duration-200"
                        />
                      </div>
                    </BLVCard>
                  </Link>
                );
              })}
            </div>
          }
          rightContent={
            <div className="space-y-4">
              {orgs.map((org) => (
                <BLVCard key={org.id} hoverable>
                  <h3 className="text-white font-semibold">{org.name}</h3>
                  <p className="text-xs text-[rgba(255,255,255,0.35)] font-mono mt-1">
                    {org.id}
                  </p>
                </BLVCard>
              ))}
            </div>
          }
        />
      )}
    </BLVPageContainer>
  );
}
