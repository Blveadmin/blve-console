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
  BLVSparkline,
} from "@/components/blve";

import {
  Users,
  Mail,
  Calendar,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Building2, // ✅ REQUIRED IMPORT
} from "lucide-react";

type Member = {
  id: string;
  name: string;
  email: string;
  org_id: string;
  created_at: string;
};

type Org = {
  id: string;
  name: string;
};

type Transaction = {
  id: string;
  amount: number;
  routing_amount: number;
  timestamp: string;
  external_tx_id?: string;
};

type MemberDetailResponse = {
  member?: Member;
  org?: Org;
  transactions?: Transaction[];
  error?: string;
};

const SPARK_TX = [4, 6, 5, 8, 7, 10, 9, 12, 11, 14];
const SPARK_ROUTING = [20, 24, 22, 28, 26, 32, 30, 36, 34, 40];

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params.id;

  const [data, setData] = useState<MemberDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/member-dashboard?id=${memberId}`);
        const json = (await res.json()) as MemberDetailResponse;

        if (!res.ok) {
          setError(json.error || "Failed to load member.");
          return;
        }

        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load member.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [memberId]);

  if (error) {
    return (
      <BLVPageContainer title="Member Details">
        <BLVCard>
          <p className="text-[#F87171] font-medium">{error}</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  if (loading || !data) {
    return (
      <BLVPageContainer title="Member Details">
        <BLVCard>
          <p className="text-[rgba(255,255,255,0.60)]">Loading member data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const { member, org, transactions = [] } = data;

  if (!member) {
    return (
      <BLVPageContainer title="Member Details">
        <BLVCard>
          <p className="text-[#F87171] font-medium">Member not found.</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalRouting = transactions.reduce((sum, t) => sum + t.routing_amount, 0);

  const totalsMetrics = [
    {
      label: "Total Transactions",
      value: transactions.length,
      icon: <Users size={22} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_TX} color="#3B82F6" />,
    },
    {
      label: "Total Volume",
      value: `$${totalVolume.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUp size={22} />,
      sparkline: <BLVSparkline data={SPARK_ROUTING} color="#A78BFA" />,
    },
    {
      label: "Total Routing",
      value: `$${totalRouting.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <ArrowRight size={22} />,
    },
  ];

  const joinedDate = new Date(member.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <BLVPageContainer
      title={member.name}
      subtitle="Member profile and transaction analytics"
    >
      {/* MEMBER PROFILE */}
      <BLVCard>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#0B0E11] rounded-xl flex items-center justify-center text-[rgba(255,255,255,0.35)]">
            <Users size={28} />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">{member.name}</h3>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)]">
                <Mail size={12} />
                {member.email}
              </div>

              <span className="text-[rgba(255,255,255,0.20)]">·</span>

              <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)]">
                <Calendar size={12} />
                Joined {joinedDate}
              </div>

              <span className="text-[rgba(255,255,255,0.20)]">·</span>

              <p className="text-xs text-[rgba(255,255,255,0.35)] font-mono">
                ID: {member.id}
              </p>
            </div>
          </div>
        </div>
      </BLVCard>

      {/* KPI ROW */}
      <BLVTotalsRow metrics={totalsMetrics} />

      <BLVSeparationLine />

      {/* TRANSACTION OVERVIEW */}
      <BLVSectionHeader
        title="Transaction Overview"
        subtitle="Volume and routing metrics"
        icon={<TrendingUp size={20} />}
      />

      <BLVTwoColumn
        leftTitle="Transactions"
        rightTitle="Summary"
        leftContent={
          <div className="space-y-4">
            {transactions.map((tx) => {
              const routingPercent =
                tx.amount > 0
                  ? ((tx.routing_amount / tx.amount) * 100).toFixed(2)
                  : "0.00";

              return (
                <BLVCard key={tx.id} hoverable>
                  <BLVMetric
                    label="Amount"
                    value={`$${tx.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                    size="lg"
                  />

                  <BLVMetric
                    label="Routing Amount"
                    value={`$${tx.routing_amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                    size="md"
                  />

                  <BLVMetric label="Routing %" value={`${routingPercent}%`} size="md" />

                  <p className="text-xs text-[rgba(255,255,255,0.35)] font-mono mt-2">
                    {new Date(tx.timestamp).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </BLVCard>
              );
            })}
          </div>
        }
        rightContent={
          <div className="space-y-4">
            <BLVMetric label="Total Transactions" value={transactions.length} size="lg" />

            <BLVMetric
              label="Total Volume"
              value={`$${totalVolume.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              size="md"
            />

            <BLVMetric
              label="Total Routing"
              value={`$${totalRouting.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              size="md"
            />
          </div>
        }
      />

      <BLVSeparationLine />

      {/* ORGANIZATION */}
      <BLVSectionHeader
        title="Organization"
        subtitle="Member's parent organization"
        icon={<Building2 size={20} />} // ✅ FIXED
      />

      {org ? (
        <Link href={`/admin/orgs/${org.id}`}>
          <BLVCard hoverable>
            <h3 className="text-white font-semibold">{org.name}</h3>
            <p className="text-xs text-[rgba(255,255,255,0.35)] font-mono mt-1">
              {org.id}
            </p>
          </BLVCard>
        </Link>
      ) : (
        <BLVCard>
          <p className="text-[rgba(255,255,255,0.60)]">No organization assigned.</p>
        </BLVCard>
      )}
    </BLVPageContainer>
  );
}
