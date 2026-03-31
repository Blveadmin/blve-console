"use client";

import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  CreditCard, 
  RefreshCw, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  Users
} from "lucide-react";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
} from "@/components/blve";

export default function TransactionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Failed to load transaction data.");
          return;
        }
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load transaction data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Transactions" subtitle="Real-time monitor of all network activity">
        <div className="flex items-center justify-center py-[var(--blv-2xl)]">
          <RefreshCw className="animate-spin text-[var(--blv-accent)]" size={40} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Transactions" subtitle="Real-time monitor of all network activity">
        <BLVCard>
          <div className="flex items-center gap-[var(--blv-lg)] text-red-400">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const summary = data?.summary || {};
  
  const totalsMetrics = [
    {
      label: "Total Transactions",
      value: (summary.total_tx || 0).toLocaleString(),
      icon: <CreditCard size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Total Volume",
      value: `$${(summary.total_volume || 0).toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Total Routed",
      value: `$${(summary.total_routed || 0).toLocaleString()}`,
      trend: { value: 8.4, direction: "up" as const },
      icon: <TrendingUp size={24} />,
    },
    {
      label: "Avg Routing %",
      value: `${(summary.avg_routing_percentage || 0).toFixed(2)}%`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer 
      title="Transactions" 
      subtitle="Complete ledger of all routing and attribution events across the network"
    >
      <div className="flex justify-between items-center gap-[var(--blv-lg)]">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-blv-md top-1/2 transform -translate-y-1/2 text-[var(--blv-text-primary)]-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, member, or merchant..." 
            className="w-full bg-[var(--blv-bg)]-secondary border border-[var(--blv-border)] rounded-[var(--blv-radius-lg)] pl-[var(--blv-xl)] pr-[var(--blv-lg)] py-[var(--blv-md)] text-[var(--blv-text-primary)] placeholder-blv-text-tertiary focus:outline-none focus:border-blv-accent transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-[var(--blv-md)]">
          <button className="flex items-center gap-[var(--blv-md)] px-[var(--blv-lg)] py-[var(--blv-md)] rounded-[var(--blv-radius-lg)] border border-[var(--blv-border)] text-[var(--blv-text-primary)]-secondary hover:bg-[var(--blv-bg)]-secondary transition-all duration-200">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex items-center gap-[var(--blv-md)] px-[var(--blv-lg)] py-[var(--blv-md)] rounded-[var(--blv-radius-lg)] bg-blv-accent text-blv-bg font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <BLVTotalsRow metrics={totalsMetrics} />
      
      <BLVSeparationLine />

      <div className="space-y-blv-lg">
        <BLVSectionHeader
          title="Transaction Ledger"
          subtitle="Real-time activity feed with full attribution data"
          icon={<CreditCard size={20} />}
        />
        
        <BLVCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--blv-bg)] border-b border-[var(--blv-border)]">
                  <th className="px-[var(--blv-lg)] py-[var(--blv-md)] text-[0.75rem] font-bold text-[var(--blv-text-primary)]-tertiary uppercase tracking-widest">Date/Time</th>
                  <th className="px-[var(--blv-lg)] py-[var(--blv-md)] text-[0.75rem] font-bold text-[var(--blv-text-primary)]-tertiary uppercase tracking-widest">Member</th>
                  <th className="px-[var(--blv-lg)] py-[var(--blv-md)] text-[0.75rem] font-bold text-[var(--blv-text-primary)]-tertiary uppercase tracking-widest">Organization</th>
                  <th className="px-[var(--blv-lg)] py-[var(--blv-md)] text-[0.75rem] font-bold text-[var(--blv-text-primary)]-tertiary uppercase tracking-widest text-right">Amount</th>
                  <th className="px-[var(--blv-lg)] py-[var(--blv-md)] text-[0.75rem] font-bold text-[var(--blv-text-primary)]-tertiary uppercase tracking-widest text-right">Routed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blv-border">
                {/* Mock data for visualization since actual transaction list is nested or fetched separately */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-[var(--blv-bg)] transition-colors duration-200">
                    <td className="px-[var(--blv-lg)] py-[var(--blv-lg)]">
                      <div className="flex flex-col">
                        <span className="text-[0.875rem] font-bold text-[var(--blv-text-primary)]">Oct {10+i}, 2023</span>
                        <span className="text-[0.75rem] text-[var(--blv-text-primary)]-tertiary">14:2{i} PM</span>
                      </div>
                    </td>
                    <td className="px-[var(--blv-lg)] py-[var(--blv-lg)]">
                      <div className="flex items-center gap-[var(--blv-md)]">
                        <div className="w-8 h-8 bg-[var(--blv-bg)] rounded-[var(--blv-radius-md)] flex items-center justify-center text-[var(--blv-text-primary)]-tertiary">
                          <Users size={16} />
                        </div>
                        <span className="text-[0.875rem] font-medium text-[var(--blv-text-primary)]">Member {i}</span>
                      </div>
                    </td>
                    <td className="px-[var(--blv-lg)] py-[var(--blv-lg)]">
                      <div className="flex items-center gap-[var(--blv-md)]">
                        <div className="w-8 h-8 bg-[var(--blv-bg)] rounded-[var(--blv-radius-md)] flex items-center justify-center text-[var(--blv-text-primary)]-tertiary">
                          <Building2 size={16} />
                        </div>
                        <span className="text-[0.875rem] font-medium text-[var(--blv-text-primary)]">Organization {i}</span>
                      </div>
                    </td>
                    <td className="px-[var(--blv-lg)] py-[var(--blv-lg)] text-right">
                      <span className="text-[0.875rem] font-bold text-[var(--blv-text-primary)]">${(Math.random() * 1000).toFixed(2)}</span>
                    </td>
                    <td className="px-[var(--blv-lg)] py-[var(--blv-lg)] text-right">
                      <span className="text-[0.875rem] font-bold text-[var(--blv-accent)]">${(Math.random() * 100).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BLVCard>
      </div>
    </BLVPageContainer>
  );
}
