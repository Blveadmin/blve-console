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
  Store,
  TrendingUp,
  ShoppingCart,
  Percent,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface Merchant {
  id: string;
  name: string;
  category?: string;
  created_at?: string;
}

interface Transaction {
  id: string;
  amount: number;
  routing_amount: number;
  timestamp: string;
  merchant_id: string;
  offer_percentage?: number;
  mcc_code?: string;
  external_tx_id?: string;
}

interface OrgDashboardResponse {
  merchants?: Merchant[];
  transactions?: Transaction[];
  error?: string;
}

const SPARK_TX = [4, 6, 5, 8, 7, 10, 9, 12, 11, 14];
const SPARK_VOLUME = [200, 240, 220, 260, 250, 300, 280, 330, 310, 360];
const SPARK_ROUTING = [20, 24, 22, 28, 26, 32, 30, 36, 34, 40];

export default function MerchantDetailPage() {
  const params = useParams();
  const merchantId = params.id;

  const [data, setData] = useState<OrgDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org-dashboard");
        const json = (await res.json()) as OrgDashboardResponse;
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

  if (error) {
    return (
      <BLVPageContainer title="Merchant Details">
        <BLVCard>
          <p className="text-[#F87171] font-medium">{error}</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  if (loading || !data) {
    return (
      <BLVPageContainer title="Merchant Details">
        <BLVCard>
          <p className="text-[rgba(255,255,255,0.60)]">Loading merchant data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const merchants = data.merchants || [];
  const transactions = data.transactions || [];

  const merchant = merchants.find((m: any) => m.id === merchantId);

  if (!merchant) {
    return (
      <BLVPageContainer title="Merchant Details">
        <BLVCard>
          <p className="text-[#F87171] font-medium">Merchant not found.</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const merchantTx = transactions.filter((t: any) => t.merchant_id === merchantId);

  const totalTransactionAmount = merchantTx.reduce(
    (sum: number, t: any) => sum + (t.amount || 0),
    0
  );

  const totalRoutingAmount = merchantTx.reduce(
    (sum: number, t: any) => sum + (t.routing_amount || 0),
    0
  );

  const totalTransactions = merchantTx.length;
  const averageTransactionAmount =
    totalTransactions > 0 ? totalTransactionAmount / totalTransactions : 0;
  const averageRoutingAmount =
    totalTransactions > 0 ? totalRoutingAmount / totalTransactions : 0;

  const createdDate = merchant.created_at
    ? new Date(merchant.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const totalsMetrics = [
    {
      label: "Total Transactions",
      value: totalTransactions,
      icon: <ShoppingCart size={24} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_TX} color="#3B82F6" />,
    },
    {
      label: "Transaction Volume",
      value: `$${totalTransactionAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUp size={24} />,
      sparkline: <BLVSparkline data={SPARK_VOLUME} color="#A78BFA" />,
    },
    {
      label: "Routing Generated",
      value: `$${totalRoutingAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <ArrowRight size={24} />,
      sparkline: <BLVSparkline data={SPARK_ROUTING} color="#4ADE80" />,
    },
    {
      label: "Merchant Status",
      value: "Active",
      icon: <Store size={24} />,
    },
  ];

  return (
    <BLVPageContainer
      title={merchant.name}
      subtitle="Merchant profile and transaction overview"
    >
      {/* MERCHANT PROFILE CARD */}
      <BLVCard>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#0B0E11] rounded-xl flex items-center justify-center text-[rgba(255,255,255,0.35)]">
            <Store size={28} />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">{merchant.name}</h3>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <p className="text-xs text-[rgba(255,255,255,0.35)] font-medium">
                Category: {merchant.category || "—"}
              </p>

              <span className="text-[rgba(255,255,255,0.20)]">·</span>

              <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)] font-medium">
                <Calendar size={12} />
                Joined {createdDate}
              </div>

              <span className="text-[rgba(255,255,255,0.20)]">·</span>

              <p className="text-xs text-[rgba(255,255,255,0.35)] font-mono">
                ID: {merchant.id}
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
        leftTitle="Transaction Metrics"
        rightTitle="Routing Impact"
        leftContent={
          <div className="space-y-4">
            <BLVMetric label="Total Transactions" value={totalTransactions} size="lg" />
            <BLVMetric
              label="Total Volume"
              value={`$${totalTransactionAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              size="md"
            />
            <BLVMetric
              label="Average Transaction Amount"
              value={`$${averageTransactionAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              size="md"
            />
          </div>
        }
        rightContent={
          <div className="space-y-4">
            <BLVMetric
              label="Total Routing Generated"
              value={`$${totalRoutingAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              size="lg"
            />
            <BLVMetric
              label="Average Routing Per Transaction"
              value={`$${averageRoutingAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              size="md"
            />
            <BLVMetric
              label="Routing as % of Volume"
              value={
                totalTransactionAmount > 0
                  ? `${((totalRoutingAmount / totalTransactionAmount) * 100).toFixed(2)}%`
                  : "—"
              }
              size="md"
            />
          </div>
        }
      />

      <BLVSeparationLine />

      {/* TRANSACTION HISTORY — CARD-BASED */}
      <BLVSectionHeader
        title="Transaction History"
        subtitle={`${totalTransactions} transaction${totalTransactions !== 1 ? "s" : ""}`}
        icon={<ArrowRight size={20} />}
      />

      {totalTransactions === 0 ? (
        <BLVCard>
          <p className="text-[rgba(255,255,255,0.60)]">No transactions for this merchant.</p>
        </BLVCard>
      ) : (
        <BLVTwoColumn>
          {merchantTx.map((tx) => {
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

                <BLVMetric
                  label="Offer %"
                  value={tx.offer_percentage ? `${tx.offer_percentage}%` : "—"}
                  size="sm"
                />

                <BLVMetric label="MCC Code" value={tx.mcc_code || "—"} size="sm" />

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
        </BLVTwoColumn>
      )}

      <BLVSeparationLine />

      {/* PERFORMANCE SUMMARY */}
      {totalTransactions > 0 && (
        <>
          <BLVSectionHeader
            title="Performance Metrics"
            subtitle="Key performance indicators"
            icon={<Percent size={20} />}
          />

          <BLVTwoColumn>
            <BLVCard>
              <BLVMetric
                label="Routing Efficiency"
                value={`${((totalRoutingAmount / totalTransactionAmount) * 100).toFixed(2)}%`}
                size="lg"
              />
            </BLVCard>

            <BLVCard>
              <BLVMetric
                label="Transactions Per Day"
                value={
                  totalTransactions > 0
                    ? (
                        totalTransactions /
                        ((Date.now() - new Date(merchant.created_at || Date.now()).getTime()) /
                          (1000 * 60 * 60 * 24) +
                          1)
                      ).toFixed(2)
                    : "—"
                }
                size="lg"
              />
            </BLVCard>

            <BLVCard>
              <BLVMetric
                label="Average Routing Per Day"
                value={`$${(
                  totalRoutingAmount /
                  ((Date.now() - new Date(merchant.created_at || Date.now()).getTime()) /
                    (1000 * 60 * 60 * 24) +
                    1)
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                size="lg"
              />
            </BLVCard>
          </BLVTwoColumn>
        </>
      )}
    </BLVPageContainer>
  );
}
