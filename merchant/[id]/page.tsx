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

  // ─────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BLVPageContainer title="Merchant Details">
        <BLVCard>
          <p className="text-red-700 font-medium">{error}</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────
  if (loading || !data) {
    return (
      <BLVPageContainer title="Merchant Details">
        <BLVCard>
          <p className="text-gray-600">Loading merchant data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const merchants = data.merchants || [];
  const transactions = data.transactions || [];

  const merchant = merchants.find((m: any) => m.id === merchantId);

  // ─────────────────────────────────────────────────────────────────
  // NOT FOUND STATE
  // ─────────────────────────────────────────────────────────────────
  if (!merchant) {
    return (
      <BLVPageContainer title="Merchant Details">
        <BLVCard>
          <p className="text-red-700 font-medium">Merchant not found.</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // CALCULATE METRICS
  // ─────────────────────────────────────────────────────────────────
  const merchantTx = transactions.filter(
    (t: any) => t.merchant_id === merchantId
  );

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

  // ─────────────────────────────────────────────────────────────────
  // TOTALS ROW METRICS
  // ─────────────────────────────────────────────────────────────────
  const totalsMetrics = [
    {
      label: "Total Transactions",
      value: totalTransactions,
      icon: <ShoppingCart size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Transaction Volume",
      value: `$${totalTransactionAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUp size={24} />,
    },
    {
      label: "Routing Generated",
      value: `$${totalRoutingAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <ArrowRight size={24} />,
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
      {/* MERCHANT INFORMATION CARD */}
      <BLVCard>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Merchant ID
                </p>
                <p className="text-gray-900 font-mono text-sm">{merchant.id}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Category
                </p>
                <p className="text-gray-900 font-medium">
                  {merchant.category || "—"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Member Since
                </p>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <p className="text-gray-900">{createdDate}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Total Transactions
                </p>
                <p className="text-gray-900 font-medium">{totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>
      </BLVCard>

      {/* TOTALS ROW */}
      <BLVTotalsRow metrics={totalsMetrics} />

      {/* SEPARATION LINE */}
      <BLVSeparationLine />

      {/* TRANSACTION OVERVIEW */}
      <div className="space-y-6">
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
              <BLVMetric
                label="Total Transactions"
                value={totalTransactions}
                size="lg"
              />
              <BLVMetric
                label="Total Transaction Volume"
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
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Transaction History"
          subtitle={`${totalTransactions} transaction${totalTransactions !== 1 ? "s" : ""}`}
          icon={<ArrowRight size={20} />}
        />
        {totalTransactions === 0 ? (
          <BLVCard>
            <p className="text-gray-600">No transactions for this merchant.</p>
          </BLVCard>
        ) : (
          <BLVCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Routing
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Offer %
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      MCC
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      External ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {merchantTx.map((transaction: any) => {
                    const formattedDate = new Date(
                      transaction.timestamp
                    ).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ${transaction.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${transaction.routing_amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.offer_percentage || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.mcc_code || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                          {transaction.external_tx_id || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </BLVCard>
        )}
      </div>

      {/* PERFORMANCE SUMMARY */}
      {totalTransactions > 0 && (
        <div className="space-y-6">
          <BLVSectionHeader
            title="Performance Metrics"
            subtitle="Key performance indicators"
            icon={<Percent size={20} />}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        ((new Date().getTime() -
                          new Date(merchant.created_at || Date.now()).getTime()) /
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
                  ((new Date().getTime() -
                    new Date(merchant.created_at || Date.now()).getTime()) /
                    (1000 * 60 * 60 * 24) +
                    1)
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                size="lg"
              />
            </BLVCard>
          </div>
        </div>
      )}
    </BLVPageContainer>
  );
}
