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
  BLVSparkline,
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

const SPARK_ROUTING = [10, 12, 15, 18, 17, 22, 20, 25, 28, 30];
const SPARK_MEMBERS = [2, 3, 4, 5, 6, 7, 7, 8, 9, 10];
const SPARK_TX = [1, 2, 3, 4, 3, 5, 6, 7, 6, 8];
const SPARK_SUBORG = [1, 1, 2, 2, 3, 3, 3, 4, 4, 5];

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

  if (error) {
    return (
      <BLVPageContainer title="Organization Details">
        <BLVCard>
          <p className="text-[#F87171] font-medium">{error}</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  if (loading || !data) {
    return (
      <BLVPageContainer title="Organization Details">
        <BLVCard>
          <p className="text-[rgba(255,255,255,0.60)]">Loading organization data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const { org, suborgs = [], members = [], transactions = [] } = data;

  if (!org) {
    return (
      <BLVPageContainer title="Organization Details">
        <BLVCard>
          <p className="text-[#F87171] font-medium">Organization not found.</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  // METRICS
  const totalTransactionAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalRoutingAmount = transactions.reduce((sum, t) => sum + t.routing_amount, 0);
  const totalBLVEFees = transactions.reduce((sum, t) => sum + t.blve_fee, 0);

  const totalsMetrics = [
    {
      label: "Routing Pool",
      value: `$${Number(org.routing_pool).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_ROUTING} color="#3B82F6" />,
    },
    {
      label: "Members",
      value: members.length,
      icon: <Users size={24} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_MEMBERS} color="#4ADE80" />,
    },
    {
      label: "Transactions",
      value: transactions.length,
      icon: <ArrowRight size={24} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_TX} color="#A78BFA" />,
    },
    {
      label: "Sub-Organizations",
      value: suborgs.length,
      icon: <GitBranch size={24} />,
      trend: { value: 0, direction
